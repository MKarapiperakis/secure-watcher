const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs");
const path = require("path");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const notifyAdmin = require("../middlewares/notify-admin");

const MODEL_URL =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
const receivers = process.env.EMAIL_RECEIVERS?.split(",") || [];

async function loadModels() {
  console.log("Please wait while loading models ...");
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  console.log("The models have been loaded successfully from the URL");
}

async function detectFaces(imagePath, outputPath) {
  const absPath = path.resolve(imagePath).replace(/\\/g, "/");

  if (!fs.existsSync(absPath)) {
    console.log("Error: File does not exist:", absPath);
    return;
  }

  console.log("🔍 Processing image:", absPath);

  try {
    const imgBuffer = fs.readFileSync(absPath);
    const img = await canvas.loadImage(imgBuffer);

    const imageCanvas = canvas.createCanvas(img.width, img.height);
    const ctx = imageCanvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Detect faces with additional attributes
    const detections = await faceapi
      .detectAllFaces(imageCanvas)
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withAgeAndGender()
      .withFaceExpressions();

    console.log(`✅ Faces detected: ${detections.length}`);

    if (detections.length > 0) {
      detections.forEach(
        ({
          detection,
          landmarks,
          age,
          gender,
          genderProbability,
          expressions,
        }) => {
          const { x, y, width, height } = detection.box;

          // Draw face bounding box
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          // Draw landmarks (eyes, nose, mouth)
          ctx.fillStyle = "#ADD8E6";
          ctx.lineWidth = 1;
          landmarks.positions.forEach((pos) => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });

          // Get dominant expression
          const topExpression = Object.entries(expressions).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0];

          // Format text
          const text = `Age: ${Math.round(
            age
          )} | Gender: ${gender} (${Math.round(
            genderProbability * 100
          )}%) | ${topExpression}`;

          // Draw text box
          ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
          ctx.fillRect(x, y - 20, ctx.measureText(text).width + 110, 18);

          // Draw text
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          ctx.fillText(text, x + 5, y - 5);
        }
      );

      // Save output image
      const outStream = fs.createWriteStream(outputPath);
      const stream = imageCanvas.createPNGStream();
      stream.pipe(outStream);

      outStream.on("finish", () => notifyAdmin(outputPath, receivers));
    } else {
      notifyAdmin(imagePath, receivers);
    }
  } catch (err) {
    console.log("error processing image:", err);
  }
}

module.exports = {
  loadModels,
  detectFaces,
};
