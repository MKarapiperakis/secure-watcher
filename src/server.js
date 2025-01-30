const express = require("express");
const cors = require("cors");

const {
  RestError,
  AuthError,
  BadRequestError,
  NotFoundError,
} = require("./lib/errors");

const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const limitReached = require("./middlewares/limit-reached");
require("dotenv").config();

const limiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes
  limit: 200, // Limit each IP to 200 requests per `window`
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: limitReached,
});

const app = express()
  .use(cors())
  .use(express.json({ limit: "20MB" }))
  .use(morgan("combined"))
  .use(limiter);

module.exports = async () => {
  return app
    .use("*", (req, res, next) => next(new NotFoundError()))
    .use((err, req, res, next) => {
      const isOpenApi = !!err.errors;
      if (!isOpenApi) return next(err);
      switch (err.message) {
        case "not found":
          return next(new NotFoundError());
        default:
          if (!err.status || err.status === 400)
            return next(new BadRequestError(err.message));
          if (err.status === 401) return next(new AuthError(err.message));
          return next(err);
      }
    })
    .use((err, req, res, next) => {
      if (!(err instanceof RestError) && !err.status) {
        err.status = 500;
        err.statusDetail = "Internal Server Error";
      }
      res.status(err.status).send({
        error: true,
        status: err.status,
        statusDetail: err.statusDetail,
        type: err.name,
        message: err.message,
      });
      console.error("error: ", err);
    });
};
