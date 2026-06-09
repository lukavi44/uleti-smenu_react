import { AxiosResponse } from "axios";
import { PendingReview, Review, ReviewSummary, SubmitReviewPayload } from "../models/Review.model";
import axiosInstance from "./axiosConfig";

export const GetMyPendingReviews = async(): Promise<AxiosResponse<PendingReview[]>> => {
  return axiosInstance.get<PendingReview[]>("/api/v1/Review/me/pending");
};

export const SubmitReview = async(payload: SubmitReviewPayload): Promise<AxiosResponse<Review>> => {
  return axiosInstance.post<Review>("/api/v1/Review", payload);
};

export const GetEmployeeReviews = async(employeeId: string): Promise<AxiosResponse<Review[]>> => {
  return axiosInstance.get<Review[]>(`/api/v1/Review/employees/${employeeId}`);
};

export const GetEmployeeReviewSummary = async(
  employeeId: string
): Promise<AxiosResponse<ReviewSummary>> => {
  return axiosInstance.get<ReviewSummary>(`/api/v1/Review/employees/${employeeId}/summary`);
};
