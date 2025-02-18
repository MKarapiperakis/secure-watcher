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
const mainErrorHandler = (err) => console.error(err);
process.on("uncaughtException", mainErrorHandler);
process.on("unhandledRejection", mainErrorHandler);

const storeFolder = path.join(__dirname, "store");

if (!fs.existsSync(storeFolder)) {
  fs.mkdirSync(storeFolder, { recursive: true });
}

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

  const watermarkPath = path.join(__dirname, "/assets/logo/logo_3.png");

  chokidar
    .watch("./src/camera/alarm/VF0410870SIJM/")
    .on("add", async (filePath) => {
      if (process.env.NOTIFY_ADMIN == "true") {
        try {
          const fileName = path.basename(filePath);
          const fileExtension = path.extname(fileName).toLowerCase();
          const storePath = path.join(storeFolder, `${Date.now()}_${fileName}`);

          if (![".jpg", ".jpeg", ".png"].includes(fileExtension)) {
            console.log(`Skipped non-image file: ${fileName}`);
            return;
          }

          // Ensure source file exists before processing
          if (!fs.existsSync(filePath)) {
            console.error("Source file does not exist:", filePath);
            return;
          }

          const image = sharp(filePath);
          const watermark = await sharp(watermarkPath)
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
            .toFile(storePath) // Save directly to file instead of using buffer
            .then(async () => {
              console.log("Watermarked image saved:", storePath);

              const receivers = process.env.EMAIL_RECEIVERS?.split(",") || [];
              // notifyAdmin(storePath, receivers);
            })
            .catch((err) => {
              console.error("Error processing image:", err);
            });
        } catch (err) {
          console.error("Error processing file:", err);
        }
      }
    });
});
