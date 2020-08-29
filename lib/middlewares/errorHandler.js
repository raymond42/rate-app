"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("../config"));

var _logger = _interopRequireDefault(require("../helpers/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var errorHandler = function errorHandler(err, req, res, next) {
  _logger["default"].error('I caught the error', err);

  if (!err.isOperational) {
    if (_config["default"].NODE_ENV !== 'development') {
      _logger["default"].error('An unexpected error occurred please restart the application!', "\nError: ".concat(err.message, " Stack: ").concat(err.stack));

      process.exit(1);
    }
  }

  _logger["default"].error("".concat(err.statusCode || 500, " - ").concat(err.message, " - ").concat(req.originalUrl, " - ").concat(req.method, " - ").concat(req.ip, " - Stack: ").concat(err.stack));

  err.stack = err.stack || '';
  var errorDetails = {
    message: err.message,
    statusCode: err.statusCode || 500,
    data: err.data,
    stack: err.stack
  };

  if (_config["default"].NODE_ENV === 'production') {
    delete errorDetails.stack;
  }

  return res.status(err.statusCode || 500).jsend.error(errorDetails);
};

var _default = errorHandler;
exports["default"] = _default;