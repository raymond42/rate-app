"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _notifications = require("../controller/notifications.controller");

var notificationsRouter = new _express.Router();
notificationsRouter.get("/", _notifications.getnotifications);
var _default = notificationsRouter;
exports["default"] = _default;