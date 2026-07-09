import { NavigateFunction } from "react-router-dom";
import { UserNotification } from "../models/Notification.model";

export const isApplicationReceivedNotification = (type: string) =>
  type === "ApplicationReceived" || type.startsWith("ApplicationReceived:");

export const isNavigableNotification = (type: string) =>
  type === "ReviewReminder" || isApplicationReceivedNotification(type);
export const handleNotificationNavigation = (
  notification: UserNotification,
  navigate: NavigateFunction
) => {
  if (notification.type === "ReviewReminder") {
    navigate("/profile");
    return true;
  }

  if (isApplicationReceivedNotification(notification.type)) {
    navigate("/oglasi-za-posao", {
      state: {
        openCandidatesPanel: true,
        jobPostId: notification.jobPostId,
      },
    });
    return true;
  }

  return false;
};
