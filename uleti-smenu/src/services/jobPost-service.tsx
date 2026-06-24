import { JobPostDTO } from "../DTOs/JobPost.dto";
import { EmployerDashboardSummary } from "../models/EmployerDashboardSummary.model";
import { JobPost } from "../models/JobPost.model";
import { PagedResult } from "../models/PagedResult.model";
import axiosInstance from "./axiosConfig"
import { AxiosResponse } from "axios";

export interface GetMyJobPostsPagedParams {
  page: number;
  pageSize: number;
  position?: string;
  status?: string;
  lifecycle?: "active" | "archived" | "all";
  sortBy?: "createdAt" | "startingDate" | "position" | "applicantCount";
  sortDirection?: "asc" | "desc";
  hasApplicants?: boolean;
  city?: string;
  restaurantLocationId?: string;
  minSalary?: number;
  maxSalary?: number;
}


export const CreateJobPost = async(body: JobPostDTO): Promise<AxiosResponse<JobPostDTO>> => {
    return axiosInstance.post<JobPostDTO>("/api/v1/JobPost/createJobPost", body);
}

export const GetAllJobPosts = async(sortBy: "createdAt" | "salary" = "createdAt", sortDirection: "asc" | "desc" = "desc"): Promise<AxiosResponse<JobPost[]>> => {
    return axiosInstance.get<JobPost[]>("/api/v1/JobPost", {
        params: {
            sortBy,
            sortDirection
        }
    });
}

export const GetMyJobPosts = async(): Promise<AxiosResponse<JobPost[]>> => {
    return axiosInstance.get<JobPost[]>("/api/v1/JobPost/my");
}

export const GetMyJobPostsPaged = async(
    params: GetMyJobPostsPagedParams
): Promise<AxiosResponse<PagedResult<JobPost>>> => {
    return axiosInstance.get<PagedResult<JobPost>>("/api/v1/JobPost/my", {
        params: {
            page: params.page,
            pageSize: params.pageSize,
            position: params.position || undefined,
            status: params.status || undefined,
            lifecycle: params.lifecycle && params.lifecycle !== "all" ? params.lifecycle : undefined,
            sortBy: params.sortBy,
            sortDirection: params.sortDirection,
            hasApplicants: params.hasApplicants || undefined,
            city: params.city || undefined,
            restaurantLocationId: params.restaurantLocationId || undefined,
            minSalary: params.minSalary,
            maxSalary: params.maxSalary,
        }
    });
}

export const GetEmployerDashboardSummary = async(): Promise<AxiosResponse<EmployerDashboardSummary>> => {
    return axiosInstance.get<EmployerDashboardSummary>("/api/v1/JobPost/my/dashboard-summary");
}

export const GetMyJobPostPositions = async(): Promise<AxiosResponse<string[]>> => {
    return axiosInstance.get<string[]>("/api/v1/JobPost/my/positions");
}

export const UpdateMyJobPost = async(jobPostId: string, body: JobPostDTO): Promise<AxiosResponse<JobPostDTO>> => {
    return axiosInstance.put<JobPostDTO>(`/api/v1/JobPost/my/${jobPostId}`, body);
}