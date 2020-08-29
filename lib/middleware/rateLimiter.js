"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customRedisRateLimiter = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _redis = _interopRequireDefault(require("redis"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var redisClient = _redis["default"].createClient({
  host: "redis-server",
  port: 6379
});

var WINDOW_SIZE_IN_SECONDS = 60;
var MAX_WINDOW_REQUEST_COUNT_IN_SECONDS = 10;
var WINDOW_LOG_INTERVAL_IN_SECONDS = 1;
var WINDOW_SIZE_IN_MONTH = 1;
var MAX_WINDOW_REQUEST_COUNT_IN_MONTH = 100;

var customRedisRateLimiter = function customRedisRateLimiter(req, res, next) {
  try {
    // check that redis client exists
    if (!redisClient) {
      throw new Error("Redis client does not exist!");
      process.exit(1);
    } // fetch records of current user using IP address, returns null when no record is found


    redisClient.get(req.ip, function (err, record) {
      if (err) throw err;
      var currentRequestTime = (0, _moment["default"])(); //  if no record is found , create a new record for user and store to redis

      if (record == null) {
        var newRecord = [];
        var requestLog = {
          requestTimeStamp: currentRequestTime.unix(),
          requestCount: 1
        };
        newRecord.push(requestLog);
        redisClient.set(req.ip, JSON.stringify(newRecord));
        next();
      } // if record is found, parse it's value and calculate number of requests users has made within the last month


      var MonthlyData = JSON.parse(record);
      var window_start_timestamp_in_month = (0, _moment["default"])().subtract(WINDOW_SIZE_IN_MONTH, "months").unix();
      var requestsWithinWindowMonth = MonthlyData.filter(function (entry) {
        return entry.requestTimeStamp > window_start_timestamp_in_month;
      });
      var totalWindowRequestsCountMonth = requestsWithinWindowMonth.reduce(function (accumulator, entry) {
        return accumulator + entry.requestCount;
      }, 0); // if number of requests made is greater than or equal to the desired maximum, return error

      if (totalWindowRequestsCountMonth >= MAX_WINDOW_REQUEST_COUNT_IN_MONTH) {
        res.status(429).jsend.error("You have exceeded the ".concat(MAX_WINDOW_REQUEST_COUNT_IN_MONTH, " requests in ").concat(WINDOW_SIZE_IN_MONTH, " month limit!"));
        return;
      } // if record found has not exceeded the number of request per month,
      // parse it's value and calculate number of requests users has made within the last window


      var data = JSON.parse(record);
      var window_start_timestamp_in_sec = (0, _moment["default"])().subtract(WINDOW_SIZE_IN_SECONDS, "seconds").unix();
      var requestsWithinWindowSec = data.filter(function (entry) {
        return entry.requestTimeStamp > window_start_timestamp_in_sec;
      });
      var totalWindowRequestsCount = requestsWithinWindowSec.reduce(function (accumulator, entry) {
        return accumulator + entry.requestCount;
      }, 0); // if number of requests made is greater than or equal to the desired maximum, return error

      if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT_IN_SECONDS) {
        res.status(429).jsend.error("You have exceeded the ".concat(MAX_WINDOW_REQUEST_COUNT_IN_SECONDS, " requests in ").concat(WINDOW_SIZE_IN_SECONDS, " secs limit!"));
      } else {
        // if number of requests made is less than allowed maximum, log new entry
        var lastRequestLog = data[data.length - 1];
        var potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime.subtract(WINDOW_LOG_INTERVAL_IN_SECONDS, "seconds").unix(); //  if interval has not passed since last request log, increment counter

        if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
          lastRequestLog.requestCount++;
          data[data.length - 1] = lastRequestLog;
        } else {
          //  if interval has passed, log new entry for current user and timestamp
          data.push({
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1
          });
        }

        redisClient.set(req.ip, JSON.stringify(data));
        next();
      }
    });
  } catch (error) {
    return error;
  }
};

exports.customRedisRateLimiter = customRedisRateLimiter;