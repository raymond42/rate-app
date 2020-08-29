import fs from "fs";
import path from "path";

const pathToJsonFile = "src/api/dummy/notifications.json";
export const fetchSampleData = () => {
  let rawdata = fs.readFileSync(pathToJsonFile);
  let notifications = JSON.parse(rawdata);
  return notifications;
};
