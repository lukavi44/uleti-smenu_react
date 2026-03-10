import { AxiosResponse } from "axios";
import { UserNotification } from "../models/Notification.model";
import axiosInstance from "./axiosConfig";

export const GetMyNotifications = async (): Promise<AxiosResponse<UserNotification[]>> => {
  return axiosInstance.get<UserNotification[]>("/api/v1/Notification/me");
};

export const GetMyUnreadNotificationCount = async (): Promise<AxiosResponse<{ count: number }>> => {
  return axiosInstance.get<{ count: number }>("/api/v1/Notification/me/unread-count");
};

export const MarkNotificationAsRead = async (notificationId: string): Promise<AxiosResponse> => {
  return axiosInstance.patch(`/api/v1/Notification/${notificationId}/read`);
};
