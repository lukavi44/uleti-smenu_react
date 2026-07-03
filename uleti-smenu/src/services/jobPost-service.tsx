import { JobPostDTO } from "../DTOs/JobPost.dto";
import { EmployerDashboardSummary } from "../models/EmployerDashboardSummary.model";
import { JobPostApplicationStats } from "../models/JobPostApplicationStats.model";
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


export interface GetVisibleJobPostsPagedParams {
  page: number;
  pageSize: number;
  sortBy?: "createdAt" | "salary";
  sortDirection?: "asc" | "desc";
  city?: string;
  restaurantLocationId?: string;
  position?: string;
  positions?: string[];
  minSalary?: number;
  maxSalary?: number;
  shiftDateFrom?: string;
  shiftDateTo?: string;
  applicationFilter?: "all" | "notApplied" | "applied";
  favouritesOnly?: boolean;
}

export interface VisibleJobPostFilterOptions {
  cities: string[];
  locations: Array<{ id: string; name: string; city: string }>;
  positions: string[];
  minSalary?: number;
  maxSalary?: number;
}

const normalizePagedResult = <T,>(data: unknown): PagedResult<T> => {
    if (Array.isArray(data)) {
        return {
            items: data,
            totalCount: data.length,
            page: 1,
            pageSize: data.length,
        };
    }

    const paged = data as PagedResult<T> & {
        Items?: T[];
        TotalCount?: number;
        Page?: number;
        PageSize?: number;
    };

    return {
        items: paged.items ?? paged.Items ?? [],
        totalCount: paged.totalCount ?? paged.TotalCount ?? 0,
        page: paged.page ?? paged.Page ?? 1,
        pageSize: paged.pageSize ?? paged.PageSize ?? 0,
    };
};

const normalizeFilterOptions = (data: unknown): VisibleJobPostFilterOptions => {
    const options = data as VisibleJobPostFilterOptions & {
        Cities?: string[];
        Locations?: Array<{ id: string; name: string; city: string }>;
        Positions?: string[];
        MinSalary?: number;
        MaxSalary?: number;
    };

    return {
        cities: options.cities ?? options.Cities ?? [],
        locations: options.locations ?? options.Locations ?? [],
        positions: options.positions ?? options.Positions ?? [],
        minSalary: options.minSalary ?? options.MinSalary,
        maxSalary: options.maxSalary ?? options.MaxSalary,
    };
};


export const CreateJobPost = async(body: JobPostDTO): Promise<AxiosResponse<JobPostDTO>> => {
    return axiosInstance.post<JobPostDTO>("/api/v1/JobPost/createJobPost", body);
}

export const GetVisibleJobPostsPaged = async(
    params: GetVisibleJobPostsPagedParams
): Promise<AxiosResponse<PagedResult<JobPost>>> => {
    const response = await axiosInstance.get("/api/v1/JobPost", {
        params: {
            page: params.page,
            pageSize: params.pageSize,
            sortBy: params.sortBy,
            sortDirection: params.sortDirection,
            city: params.city || undefined,
            restaurantLocationId: params.restaurantLocationId || undefined,
            position: params.position || undefined,
            positions: params.positions?.length ? params.positions : undefined,
            minSalary: params.minSalary,
            maxSalary: params.maxSalary,
            shiftDateFrom: params.shiftDateFrom,
            shiftDateTo: params.shiftDateTo,
            applicationFilter:
                params.applicationFilter && params.applicationFilter !== "all"
                    ? params.applicationFilter
                    : undefined,
            favouritesOnly: params.favouritesOnly || undefined,
        },
        paramsSerializer: {
            indexes: null,
        },
    });

    return {
        ...response,
        data: normalizePagedResult<JobPost>(response.data),
    };
}

export const GetVisibleJobPostById = async(
    jobPostId: string
): Promise<AxiosResponse<JobPost>> => {
    return axiosInstance.get<JobPost>(`/api/v1/JobPost/${jobPostId}`);
}

export const GetCandidateRecommendedJobs = async(
    pageSize = 3
): Promise<AxiosResponse<JobPost[]>> => {
    return axiosInstance.get<JobPost[]>("/api/v1/JobPost/candidate/recommended-jobs", {
        params: { pageSize },
    });
}

export const GetVisibleJobPostFilterOptions = async(
    city?: string
): Promise<AxiosResponse<VisibleJobPostFilterOptions>> => {
    const response = await axiosInstance.get("/api/v1/JobPost/filter-options", {
        params: {
            city: city || undefined,
        }
    });

    return {
        ...response,
        data: normalizeFilterOptions(response.data),
    };
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

export const GetMyJobPostApplicationStats = async(
    jobPostId: string
): Promise<AxiosResponse<JobPostApplicationStats>> => {
    const response = await axiosInstance.get(`/api/v1/JobPost/my/${jobPostId}/application-stats`);
    const data = response.data as Record<string, unknown>;
    return {
        ...response,
        data: {
            totalApplications: Number(data.totalApplications ?? data.TotalApplications ?? 0),
            accepted: Number(data.accepted ?? data.Accepted ?? 0),
            pending: Number(data.pending ?? data.Pending ?? 0),
            denied: Number(data.denied ?? data.Denied ?? 0),
        },
    };
}

export const DuplicateMyJobPost = async(jobPostId: string): Promise<AxiosResponse<JobPost>> => {
    return axiosInstance.post<JobPost>(`/api/v1/JobPost/my/${jobPostId}/duplicate`);
}

export const ArchiveMyJobPost = async(jobPostId: string): Promise<AxiosResponse<{ message: string }>> => {
    return axiosInstance.post(`/api/v1/JobPost/my/${jobPostId}/archive`);
}

export const DeleteMyJobPost = async(jobPostId: string): Promise<AxiosResponse<{ message: string }>> => {
    return axiosInstance.delete(`/api/v1/JobPost/my/${jobPostId}`);
}