"use strict";

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _express = _interopRequireDefault(require("express"));

var _morgan = _interopRequireDefault(require("morgan"));

var _cors = _interopRequireDefault(require("cors"));

var _jsend = _interopRequireDefault(require("jsend"));

var _helpers = require("./helpers");

var _config = _interopRequireDefault(require("./config"));

var _middleware = require("./middleware");

var _router = require("./api/router");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Essential globals
var app = (0, _express["default"])(); //  Initialize global application middlewares

app.use((0, _cors["default"])());
app.use((0, _morgan["default"])("combined"));
app.use(_bodyParser["default"].urlencoded({
  extended: true
}));
app.use(_bodyParser["default"].json({
  type: "application/json"
}));
app.use(_jsend["default"].middleware);
app.use(_middleware.customRedisRateLimiter); // Initialize API routing

app.use("/notifications", _router.notificationsRouter);
app.listen(_config["default"].APP.PORT, function () {
  _helpers.logger.info("Starting server on  port ".concat(_config["default"].APP.PORT));
}); // // Initialize Global Error Handlers

app.use(_middleware.errorHandler);
process.on("unhandledRejection", function (reason, promise) {
  throw reason;
});
process.on("uncaughtException", function (error) {
  _helpers.logger.error("Uncaught Exception: ".concat(500, " - ", error.message, ", Stack: ").concat(error.stack));
});
process.on("SIGINT", function () {
  _helpers.logger.info(" Alright! Bye bye!");

  process.exit();
});