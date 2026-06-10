import axios, { AxiosResponse } from "axios";
import { PendingReview, Review, ReviewPage, ReviewSummary, SubmitReviewPayload } from "../models/Review.model";
import axiosInstance from "./axiosConfig";

const buildReviewPageFallback = async (
  subjectId: string,
  subjectType: "employee" | "employer"
): Promise<ReviewPage> => {
  if (subjectType === "employee") {
    const [reviewsRes, summaryRes] = await Promise.all([
      GetEmployeeReviews(subjectId),
      GetEmployeeReviewSummary(subjectId),
    ]);

    return {
      subjectId,
      subjectName: "",
      summary: summaryRes.data,
      reviews: reviewsRes.data,
    };
  }

  const summaryRes = await GetEmployerReviewSummary(subjectId);
  return {
    subjectId,
    subjectName: "",
    summary: summaryRes.data,
    reviews: [],
  };
};

const getReviewPage = async (
  subjectId: string,
  subjectType: "employee" | "employer"
): Promise<AxiosResponse<ReviewPage>> => {
  const url =
    subjectType === "employee"
      ? `/api/v1/Review/employees/${subjectId}/page`
      : `/api/v1/Review/employers/${subjectId}/page`;

  try {
    return await axiosInstance.get<ReviewPage>(url);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { data: await buildReviewPageFallback(subjectId, subjectType) } as AxiosResponse<ReviewPage>;
    }
    throw error;
  }
};

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

export const GetEmployeeReviewPage = async(employeeId: string): Promise<AxiosResponse<ReviewPage>> => {
  return getReviewPage(employeeId, "employee");
};

export const GetEmployerReviewPage = async(employerId: string): Promise<AxiosResponse<ReviewPage>> => {
  return getReviewPage(employerId, "employer");
};

export const GetEmployerReviewSummary = async(
  employerId: string
): Promise<AxiosResponse<ReviewSummary>> => {
  return axiosInstance.get<ReviewSummary>(`/api/v1/Review/employers/${employerId}/summary`);
};
