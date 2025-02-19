require("dotenv").config();
const chalk = require("chalk");
const PORT = process.env.PORT || 3010;
const environment = process.env.NODE_ENV || "";
const serverInit = require("./server");
const chokidar = require("chokidar");
const notifyAdmin = require("./middlewares/notify-admin");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const cors = require("cors");
const {createFolders} = require("./util/create-folders")
const mainErrorHandler = (err) => console.error(err);
process.on("uncaughtException", mainErrorHandler);
process.on("unhandledRejection", mainErrorHandler);

const storeFolder = path.join(__dirname, "store");
const cameraFolder = path.join(__dirname, "camera");
const waterMarkFolder = path.join(__dirname, "water-mark");

createFolders(storeFolder, cameraFolder, waterMarkFolder)

serverInit().then((app) => {
  const server = require("http").createServer(app);

  server.listen(PORT, () => {
    console.log(
      "Up & running on http://localhost:" +
        chalk.blue.underline.bold(PORT) +
        " for environment: " +
        chalk.green.bold(environment)
    );
  });

  const watermarkImage = path.join(__dirname, "/assets/logo/logo_3.png");

  chokidar
    .watch("./src/camera/")
    .on("add", async (filePath) => {
      if (process.env.NOTIFY_ADMIN == "true") {
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
                    console.log("Watermarked image saved:", storePath);

                    fs.unlink(filePath, (err) => {
                      if (err) {
                        console.error("Error deleting file:", err);
                      } else {
                        console.log("File deleted successfully:", filePath);

                        const parentFolder = path.dirname(filePath);

                        fs.readdir(parentFolder, (err, files) => {
                          if (err) {
                            console.error("Error reading folder:", err);
                          } else if (files.length === 0) {
                            // If empty, delete the parent folder
                            fs.rmdir(parentFolder, (err) => {
                              if (err) {
                                console.error("Error deleting folder:", err);
                              } else {
                                console.log(
                                  "Parent folder deleted:",
                                  parentFolder
                                );
                              }
                            });
                          }
                        });
                      }
                    });
                    const receivers =
                      process.env.EMAIL_RECEIVERS?.split(",") || [];
                      notifyAdmin(waterMarkPath, receivers);
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
      }
    });
});
