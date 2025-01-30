require("dotenv").config();
const chalk = require("chalk");
const PORT = process.env.PORT || 3010;
const environment = process.env.NODE_ENV || '';
const serverInit = require("./server");

const cors = require("cors");
const mainErrorHandler = (err) => console.error(err);
process.on("uncaughtException", mainErrorHandler);
process.on("unhandledRejection", mainErrorHandler);

serverInit().then((app) => {
  const server = require("http").createServer(app);

  server.listen(PORT, () => {
    console.log(
      "Up & running on http://localhost:" + chalk.blue.underline.bold(PORT) + " for environment: " + chalk.green.bold(environment)
    );
    console.log(
      "Swagger UI is available on http://localhost:" +
        chalk.blue.underline.bold(`${PORT}/data/api/doc`)
    );
    console.log(
      "Metrics are available on http://localhost:" +
        chalk.blue.underline.bold(`${PORT}/status`)
    );
  });
});
