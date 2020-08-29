"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _winston = require("winston");

var combine = _winston.format.combine,
    printf = _winston.format.printf;
var logFormat = printf(function (info) {
  return "".concat(info.timestamp, " [").concat(info.level, "]: ").concat(info.message);
}); // instantiate a new Winston Logger

var logger = (0, _winston.createLogger)({
  format: _winston.format.combine(_winston.format.timestamp(), _winston.format.json()),
  transports: [new _winston.transports.Console({
    format: combine(_winston.format.colorize(), logFormat)
  })],
  exitOnError: false // do not exit on handled exceptionsn

});
var _default = logger;
exports["default"] = _default;