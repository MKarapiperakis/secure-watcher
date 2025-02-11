require("dotenv").config();
const chalk = require("chalk");
const PORT = process.env.PORT || 3010;
const environment = process.env.NODE_ENV || "";
const serverInit = require("./server");
const chokidar = require("chokidar");
const notifyAdmin = require("./middlewares/notify-admin");

const cors = require("cors");
const mainErrorHandler = (err) => console.error(err);
process.on("uncaughtException", mainErrorHandler);
process.on("unhandledRejection", mainErrorHandler);

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

  chokidar.watch("./src/video").on("all", (event, path) => {
    if (event === "add" && process.env.NOTIFY_ADMIN == "true") {
      console.log("here");

      const receivers = process.env.EMAIL_RECEIVERS.split(",");
      notifyAdmin(path, receivers);
    }
  });
});
