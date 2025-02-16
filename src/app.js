require("dotenv").config();
const chalk = require("chalk");
const PORT = process.env.PORT || 3010;
const environment = process.env.NODE_ENV || "";
const serverInit = require("./server");
const chokidar = require("chokidar");
const notifyAdmin = require("./middlewares/notify-admin");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp")
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

  chokidar.watch("./src/camera/alarm/VF0410870SIJM/").on("add", (filePath) => {
    if (process.env.NOTIFY_ADMIN == "true") {
      setTimeout(() => {
        const fileName = path.basename(filePath);
        const fileExtension = path.extname(fileName).toLowerCase();
        const storePath = path.join(storeFolder, `${Date.now()}_${fileName}`);

        if (![".jpg", ".jpeg", ".png"].includes(fileExtension)) {
          console.log(`Skipped non-image file: ${fileName}`);
          return;
        }

        fs.copyFile(filePath, storePath, (err) => {
          if (err) {
            console.error("Error copying file:", err);
          } else {
            console.log(`File copied to ${storePath}`);
            sharp(storePath)
              .rotate()
              .resize(200)
              .jpeg({ mozjpeg: true })
              .toBuffer()
              .then((data) => {
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
                            console.log("Parent folder deleted:", parentFolder);
                          }
                        });
                      }
                    });
                  }
                });
                const receivers = process.env.EMAIL_RECEIVERS?.split(",") || [];
                notifyAdmin(storePath, receivers);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        });
      }, 3000);
    }
  });
});
