import axiosInstance from "./axiosConfig";

export type ContactMessagePayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const SendContactMessage = (payload: ContactMessagePayload) =>
  axiosInstance.post("/api/v1/Contact", payload);
