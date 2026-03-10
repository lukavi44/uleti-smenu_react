import { AxiosResponse } from "axios";
import { Applicant, EmployeeApplication } from "../models/Application.model";
import axiosInstance from "./axiosConfig";

export const ApplyToJobPost = async (jobPostId: string): Promise<AxiosResponse> => {
  return axiosInstance.post(`/api/v1/Application/job-posts/${jobPostId}`);
};

export const GetApplicantsForJobPost = async (jobPostId: string): Promise<AxiosResponse<Applicant[]>> => {
  return axiosInstance.get(`/api/v1/Application/job-posts/${jobPostId}/applicants`);
};

export const UpdateApplicationStatus = async (
  applicationId: string,
  status: "Accepted" | "Denied"
): Promise<AxiosResponse> => {
  return axiosInstance.patch(`/api/v1/Application/${applicationId}/status`, { status });
};

export const GetMyApplications = async (): Promise<AxiosResponse<EmployeeApplication[]>> => {
  return axiosInstance.get("/api/v1/Application/me");
};

export const CancelMyApplication = async (applicationId: string): Promise<AxiosResponse> => {
  return axiosInstance.patch(`/api/v1/Application/${applicationId}/cancel`);
};
