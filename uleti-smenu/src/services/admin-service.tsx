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
