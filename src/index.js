import bodyParser from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import jsend from "jsend";
import { logger } from "./helpers";
import config from "./config";
import { errorHandler, customRedisRateLimiter } from "./middleware";
import { notificationsRouter } from "./api/router";

// Essential globals
const app = express();

//  Initialize global application middlewares
app.use(cors());
app.use(morgan("combined"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  bodyParser.json({
    type: "application/json",
  })
);
app.use(jsend.middleware);

app.use(customRedisRateLimiter);

// Initialize API routing
app.use("/notifications", notificationsRouter);

app.listen(config.APP.PORT, () => {
  logger.info(`Starting server on  port ${config.APP.PORT}`);
});

// // Initialize Global Error Handlers
app.use(errorHandler);
process.on("unhandledRejection", (reason, promise) => {
  throw reason;
});

process.on("uncaughtException", (error) => {
  logger.error(
    `Uncaught Exception: ${500} - ${error.message}, Stack: ${error.stack}`
  );
});

process.on("SIGINT", () => {
  logger.info(" Alright! Bye bye!");
  process.exit();
});
