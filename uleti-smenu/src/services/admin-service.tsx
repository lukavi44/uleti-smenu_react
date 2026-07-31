import axiosInstance from "./axiosConfig";
import {
  AdminApplicationListItem,
  AdminBillingListItem,
  AdminCandidateListItem,
  AdminDashboard,
  AdminEmployerDetail,
  AdminEmployerListResponse,
  AdminJobPostListItem,
  AdminPagedResponse,
  AdminRestaurantListItem,
  AdminUserListItem,
  AdminContactMessageDetail,
  AdminContactMessageListItem,
  AdminReportDetail,
  AdminReportListItem,
} from "../models/Admin.model";

export const getAdminDashboard = (fromUtc?: string, toUtc?: string) =>
  axiosInstance.get<AdminDashboard>("/api/v1/Admin/dashboard", {
    params: { fromUtc, toUtc },
  });

export const getAdminEmployers = (params: {
  search?: string;
  status?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}) => axiosInstance.get<AdminEmployerListResponse>("/api/v1/Admin/employers", { params });

export const getAdminEmployerDetail = (employerId: string) =>
  axiosInstance.get<AdminEmployerDetail>(`/api/v1/Admin/employers/${employerId}`);

export const setAdminEmployerVerification = (employerId: string, isVerified: boolean) =>
  axiosInstance.put<AdminEmployerDetail>(`/api/v1/Admin/employers/${employerId}/verification`, {
    isVerified,
  });

export const setAdminEmployerSuspension = (employerId: string, isSuspended: boolean) =>
  axiosInstance.put<AdminEmployerDetail>(`/api/v1/Admin/employers/${employerId}/suspension`, {
    isSuspended,
  });

export const setAdminEmployerNotes = (employerId: string, notes: string | null) =>
  axiosInstance.put<AdminEmployerDetail>(`/api/v1/Admin/employers/${employerId}/notes`, {
    notes,
  });

export const getAdminCandidates = (params: {
  search?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}) => axiosInstance.get<AdminPagedResponse<AdminCandidateListItem>>("/api/v1/Admin/candidates", { params });

export const getAdminRestaurants = (params: {
  search?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}) => axiosInstance.get<AdminPagedResponse<AdminRestaurantListItem>>("/api/v1/Admin/restaurants", { params });

export const getAdminJobPosts = (params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => axiosInstance.get<AdminPagedResponse<AdminJobPostListItem>>("/api/v1/Admin/job-posts", { params });

export const getAdminApplications = (params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => axiosInstance.get<AdminPagedResponse<AdminApplicationListItem>>("/api/v1/Admin/applications", { params });

export const getAdminBilling = (params: { search?: string; page?: number; pageSize?: number }) =>
  axiosInstance.get<AdminPagedResponse<AdminBillingListItem>>("/api/v1/Admin/billing", { params });

export const getAdminUsers = (params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => axiosInstance.get<AdminPagedResponse<AdminUserListItem>>("/api/v1/Admin/users", { params });

export const setAdminUserLockout = (userId: string, isLockedOut: boolean) =>
  axiosInstance.put<AdminUserListItem>(`/api/v1/Admin/users/${userId}/lockout`, { isLockedOut });

export const getAdminContactMessages = (params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) =>
  axiosInstance.get<AdminPagedResponse<AdminContactMessageListItem>>("/api/v1/Admin/contact-messages", {
    params,
  });

export const getAdminContactMessage = (messageId: string) =>
  axiosInstance.get<AdminContactMessageDetail>(`/api/v1/Admin/contact-messages/${messageId}`);

export const resolveAdminContactMessage = (messageId: string, notes?: string | null) =>
  axiosInstance.put<AdminContactMessageDetail>(`/api/v1/Admin/contact-messages/${messageId}/resolve`, {
    notes,
  });

export const getAdminReports = (params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) =>
  axiosInstance.get<AdminPagedResponse<AdminReportListItem>>("/api/v1/Admin/reports", {
    params,
  });

export const getAdminReport = (reportId: string) =>
  axiosInstance.get<AdminReportDetail>(`/api/v1/Admin/reports/${reportId}`);

export const resolveAdminReport = (reportId: string, notes?: string | null) =>
  axiosInstance.put<AdminReportDetail>(`/api/v1/Admin/reports/${reportId}/resolve`, {
    notes,
  });
