"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getnotifications = void 0;

var _notifications = require("../services/notifications.service");

var getnotifications = function getnotifications(req, res, next) {
  try {
    var notifications = (0, _notifications.fetchSampleData)();
    res.jsend.success(notifications);
  } catch (error) {
    next(error);
  }
};

exports.getnotifications = getnotifications;