"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchSampleData = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var pathToJsonFile = "src/api/dummy/notifications.json";

var fetchSampleData = function fetchSampleData() {
  var rawdata = _fs["default"].readFileSync(pathToJsonFile);

  var notifications = JSON.parse(rawdata);
  return notifications;
};

exports.fetchSampleData = fetchSampleData;