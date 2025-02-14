require("dotenv").config();
const chalk = require("chalk");
const PORT = process.env.PORT || 3010;
const environment = process.env.NODE_ENV || "";
const serverInit = require("./server");
const chokidar = require("chokidar");
const notifyAdmin = require("./middlewares/notify-admin");
const fs = require("fs");
const path = require("path");

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
      const fileName = path.basename(filePath);
      const storePath = path.join(storeFolder, `${Date.now()}_${fileName}`);

      fs.copyFile(filePath, storePath, (err) => {
        if (err) {
          console.error("Error copying file:", err);
        } else {
          console.log(`File copied to ${storePath}`);
        }
      });

      const receivers = process.env.EMAIL_RECEIVERS?.split(",") || [];
      notifyAdmin(filePath, receivers, storePath);
    }
  });
});
