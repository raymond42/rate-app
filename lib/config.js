"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dotenv = require("dotenv");

(0, _dotenv.config)();

var loadEnvVariable = function loadEnvVariable(envName) {
  var env = process.env[envName];

  if (env == null) {
    throw new Error("Environment variable => ".concat(envName, " is undefined."));
  }

  return env;
};

var config = {
  APP: {
    PORT: loadEnvVariable("PORT") || 7000
  }
};
var _default = config;
exports["default"] = _default;