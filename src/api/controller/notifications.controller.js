import { fetchSampleData } from "../services/notifications.service";

export const getnotifications = (req, res, next) => {
  try {
    const notifications = fetchSampleData();
    res.jsend.success(notifications);
  } catch (error) {
    next(error);
  }
};
