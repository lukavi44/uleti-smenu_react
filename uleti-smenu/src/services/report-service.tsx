import axiosInstance from "./axiosConfig";

export type ReportTargetType = "JobPost" | "Employer";

export const submitReport = (payload: {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string | null;
}) => axiosInstance.post<{ message: string }>("/api/v1/Reports", payload);
