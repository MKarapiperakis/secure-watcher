const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs");
const path = require("path");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function faceSimilarity(imageFiles) {
  const faceDescriptorMap = {};

  for (const file of imageFiles) {
    try {
      const imgBuffer = fs.readFileSync(file);
      const img = await canvas.loadImage(imgBuffer);

      const imgCanvas = canvas.createCanvas(img.width, img.height);
      const imgCtx = imgCanvas.getContext("2d");
      imgCtx.drawImage(img, 0, 0);

      const singleDetections = await faceapi
        .detectAllFaces(imgCanvas)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (singleDetections.length > 0) {
        // Store descriptor(s) per image
        faceDescriptorMap[path.basename(file)] = singleDetections.map(
          (det) => det.descriptor
        );
      }
    } catch (e) {
      console.error(`Error processing stored face image ${file}:`, e);
    }
  }

  return faceDescriptorMap;
}

function findMostSimilar(targetDescriptor, descriptorMap) {
  let bestMatch = null;
  let minDistance = 0.5;

  //Distance < 0.4:	Very high similarity (likely the same person)
  //Distance 0.4 – 0.6:	Possible match (may be same person, needs review)

  for (const [filename, descriptorArr] of Object.entries(descriptorMap)) {
    const descriptorObj = descriptorArr[0]; // Get the first object
    const descriptor = Object.values(descriptorObj); // Convert to array of numbers

    if (descriptor.length !== targetDescriptor.length) continue;
    const distance = euclideanDistance(targetDescriptor, descriptor);

    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = { filename, distance };
    }
  }

  return bestMatch;
}

function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    throw new Error("Descriptors must be the same length");
  }

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

module.exports = {
  faceSimilarity,
  findMostSimilar,
};
