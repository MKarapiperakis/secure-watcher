require("dotenv").config();
const chalk = require("chalk");
const PORT = process.env.PORT || 3010;
const serverInit = require("./server");
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const cors = require("cors");
const { createFolders } = require("./util/create-folders");
const { deleteFile } = require("./util/delete-file");
const { loadModels, detectFaces } = require("./util/face-api");
const { faceSimilarity } = require("./util/face-similarity");
const mainErrorHandler = (err) => console.error(err);
process.on("uncaughtException", mainErrorHandler);
process.on("unhandledRejection", mainErrorHandler);

const storeFolder = path.join(__dirname, "store");
const cameraFolder = path.join(__dirname, "camera");
const waterMarkFolder = path.join(__dirname, "water-mark");
const faceRepoFolder = path.join(__dirname, "face-repository");
let descriptors = null;
createFolders(storeFolder, cameraFolder, waterMarkFolder, faceRepoFolder);

const imageFiles = fs
  .readdirSync(faceRepoFolder)
  .filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return [".jpg", ".jpeg", ".png"].includes(ext);
  })
  .map((file) => path.join(faceRepoFolder, file));

serverInit().then(async (app) => {
  const server = require("http").createServer(app);
  try {
    console.log(chalk.blue("[1] Loading models ..."));
    await loadModels();
    console.log(
      chalk.green("[1] The models have been loaded successfully from the URL")
    );
  } catch (err) {
    console.error("error loading models: ", err);
  }

  server.listen(PORT, () => {
    console.log(
      "Up & running on http://localhost:" + chalk.blue.underline.bold(PORT)
    );
  });

  // If face similarity mode is enabled, scan the images in the 'face-repository' folder
  // and store the corresponding vectors (descriptors) in the appropriate array.
  if (process.env.FACE_SIMILARITY == "true") {
    try {
      console.log(chalk.blue("[2] Processing face repository images ..."));
      if (descriptors === null) {
        descriptors = await faceSimilarity(imageFiles);
        console.log(
          chalk.green(
            "[2] The face repository images have been loaded successfully from the local folder"
          )
        );
      }
    } catch (e) {
      console.log("error creating descriptors", e);
    }
  }

  const watermarkImage = path.join(__dirname, "/assets/logo/logo_3.png");

  chokidar.watch("./src/camera/").on("add", async (filePath) => {
    createFolders(storeFolder, cameraFolder, waterMarkFolder);

    try {
      const fileName = path.basename(filePath);
      const fileExtension = path.extname(fileName).toLowerCase();
      const storePath = path.join(storeFolder, `${Date.now()}_${fileName}`);
      const waterMarkPath = path.join(
        waterMarkFolder,
        `${Date.now()}_${fileName}`
      );

      if (![".jpg", ".jpeg", ".png"].includes(fileExtension)) {
        console.log(`Skipped non-image file: ${fileName}`);
        return;
      }

      // Ensure source file exists before processing
      if (!fs.existsSync(filePath)) {
        console.error("Source file does not exist:", filePath);
        return;
      }

      setTimeout(() => {
        fs.copyFile(filePath, storePath, async (err) => {
          if (err) {
            console.error("Error copying file:", err);
          } else {
            const image = sharp(storePath);
            const watermark = await sharp(watermarkImage)
              .resize(150) // Adjust size of watermark
              .toBuffer();

            // Process and save watermarked image
            image
              .composite([
                {
                  input: watermark,
                  gravity: "southeast", // Position bottom-right
                },
              ])
              .rotate()
              .resize(600)
              .jpeg({ mozjpeg: true })
              .toFile(waterMarkPath)
              .then(async () => {
                console.log(
                  `Watermarked image ${chalk.blue.underline.bold(
                    storePath
                  )} has been saved`
                );

                deleteFile(filePath);
                await detectFaces(waterMarkPath, waterMarkPath, descriptors, faceRepoFolder);
              })
              .catch((err) => {
                console.error("Error processing image:", err);
              });
          }
        });
      }, 3000);
    } catch (err) {
      console.error("Error processing file:", err);
    }
  });
});
