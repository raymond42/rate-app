import moment from "moment";
import redis from "redis";

const redisClient = redis.createClient({
  host: "redis-server",
  port: 6379,
});
const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_WINDOW_REQUEST_COUNT_IN_SECONDS = 10;
const WINDOW_LOG_INTERVAL_IN_SECONDS = 1;
const WINDOW_SIZE_IN_MONTH = 1;
const MAX_WINDOW_REQUEST_COUNT_IN_MONTH = 100;

export const customRedisRateLimiter = (req, res, next) => {
  try {
    // check that redis client exists
    if (!redisClient) {
      throw new Error("Redis client does not exist!");
      process.exit(1);
    }
    // fetch records of current user using IP address, returns null when no record is found
    redisClient.get(req.ip, function(err, record) {
      if (err) throw err;
      const currentRequestTime = moment();

      //  if no record is found , create a new record for user and store to redis
      if (record == null) {
        let newRecord = [];
        let requestLog = {
          requestTimeStamp: currentRequestTime.unix(),
          requestCount: 1,
        };
        newRecord.push(requestLog);
        redisClient.set(req.ip, JSON.stringify(newRecord));
        next();
      }

      // if record is found, parse it's value and calculate number of requests users has made within the last month
      let MonthlyData = JSON.parse(record);
      let window_start_timestamp_in_month = moment()
        .subtract(WINDOW_SIZE_IN_MONTH, "months")
        .unix();
      let requestsWithinWindowMonth = MonthlyData.filter((entry) => {
        return entry.requestTimeStamp > window_start_timestamp_in_month;
      });

      let totalWindowRequestsCountMonth = requestsWithinWindowMonth.reduce(
        (accumulator, entry) => {
          return accumulator + entry.requestCount;
        },
        0
      );
      // if number of requests made is greater than or equal to the desired maximum, return error
      if (totalWindowRequestsCountMonth >= MAX_WINDOW_REQUEST_COUNT_IN_MONTH) {
        res
          .status(429)
          .jsend.error(
            `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT_IN_MONTH} requests in ${WINDOW_SIZE_IN_MONTH} month limit!`
          );
        return;
      }

      // if record found has not exceeded the number of request per month,
      // parse it's value and calculate number of requests users has made within the last window
      let data = JSON.parse(record);
      let window_start_timestamp_in_sec = moment()
        .subtract(WINDOW_SIZE_IN_SECONDS, "seconds")
        .unix();
      let requestsWithinWindowSec = data.filter((entry) => {
        return entry.requestTimeStamp > window_start_timestamp_in_sec;
      });

      let totalWindowRequestsCount = requestsWithinWindowSec.reduce(
        (accumulator, entry) => {
          return accumulator + entry.requestCount;
        },
        0
      );
      // if number of requests made is greater than or equal to the desired maximum, return error
      if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT_IN_SECONDS) {
        res
          .status(429)
          .jsend.error(
            `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT_IN_SECONDS} requests in ${WINDOW_SIZE_IN_SECONDS} secs limit!`
          );
      } else {
        // if number of requests made is less than allowed maximum, log new entry
        let lastRequestLog = data[data.length - 1];
        let potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
          .subtract(WINDOW_LOG_INTERVAL_IN_SECONDS, "seconds")
          .unix();
        //  if interval has not passed since last request log, increment counter
        if (
          lastRequestLog.requestTimeStamp >
          potentialCurrentWindowIntervalStartTimeStamp
        ) {
          lastRequestLog.requestCount++;
          data[data.length - 1] = lastRequestLog;
        } else {
          //  if interval has passed, log new entry for current user and timestamp
          data.push({
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1,
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
