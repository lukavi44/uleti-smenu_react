import { AxiosResponse } from "axios";
import { Applicant, EmployeeApplication, EmployeeDashboard } from "../models/Application.model";
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

export const GetMyDashboard = async (
  limit = 12
): Promise<AxiosResponse<EmployeeDashboard>> => {
  const response = await axiosInstance.get("/api/v1/Application/me/dashboard", {
    params: { limit },
  });
  return {
    ...response,
    data: normalizeEmployeeDashboard(response.data),
  };
};

const pickField = (data: Record<string, unknown>, camel: string, pascal: string) =>
  data[camel] ?? data[pascal];

const normalizeEmployeeApplication = (raw: unknown): EmployeeApplication => {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    applicationId: String(pickField(data, "applicationId", "ApplicationId") ?? ""),
    jobPostId: String(pickField(data, "jobPostId", "JobPostId") ?? ""),
    jobPostTitle: String(pickField(data, "jobPostTitle", "JobPostTitle") ?? ""),
    position: String(pickField(data, "position", "Position") ?? ""),
    employerName: String(pickField(data, "employerName", "EmployerName") ?? ""),
    restaurantLocationName: (pickField(data, "restaurantLocationName", "RestaurantLocationName") as string | undefined) || undefined,
    restaurantLocationCity: (pickField(data, "restaurantLocationCity", "RestaurantLocationCity") as string | undefined) || undefined,
    startingDate: String(pickField(data, "startingDate", "StartingDate") ?? ""),
    salary: Number(pickField(data, "salary", "Salary") ?? 0),
    status: String(pickField(data, "status", "Status") ?? ""),
    appliedAt: String(pickField(data, "appliedAt", "AppliedAt") ?? ""),
  };
};

const normalizeEmployeeDashboard = (raw: unknown): EmployeeDashboard => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const nextShift = pickField(data, "nextShift", "NextShift");
  const acceptedShifts = pickField(data, "acceptedShifts", "AcceptedShifts");

  return {
    applicationCount: Number(pickField(data, "applicationCount", "ApplicationCount") ?? 0),
    acceptedShiftCount: Number(pickField(data, "acceptedShiftCount", "AcceptedShiftCount") ?? 0),
    totalEarnings: Number(pickField(data, "totalEarnings", "TotalEarnings") ?? 0),
    nextShift: nextShift ? normalizeEmployeeApplication(nextShift) : null,
    acceptedShifts: Array.isArray(acceptedShifts)
      ? acceptedShifts.map(normalizeEmployeeApplication)
      : [],
  };
};

export const CancelMyApplication = async (applicationId: string): Promise<AxiosResponse> => {
  return axiosInstance.patch(`/api/v1/Application/${applicationId}/cancel`);
};

export const GetMyPendingDashboardApplicants = async (
  limit = 12
): Promise<AxiosResponse<Applicant[]>> => {
  return axiosInstance.get("/api/v1/Application/my/pending-dashboard", {
    params: { limit },
  });
};
