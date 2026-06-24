import { AxiosResponse } from "axios";
import { EmployerDirectoryPreview } from "../models/EmployerDirectoryPreview.model";
import { EmployerPublicProfile } from "../models/EmployerPublicProfile.model";
import axiosInstance from "./axiosConfig";

const normalizeDirectoryPreview = (data: Record<string, unknown>): EmployerDirectoryPreview => ({
  employerId: String(data.employerId ?? data.EmployerId ?? ""),
  publicSlug: String(data.publicSlug ?? data.PublicSlug ?? ""),
  name: String(data.name ?? data.Name ?? ""),
  profilePhoto: (data.profilePhoto ?? data.ProfilePhoto) as string | undefined,
  city: String(data.city ?? data.City ?? ""),
  reviewSummary: {
    averageRating: Number(
      (data.reviewSummary as Record<string, unknown> | undefined)?.averageRating ??
        (data.reviewSummary as Record<string, unknown> | undefined)?.AverageRating ??
        (data.ReviewSummary as Record<string, unknown> | undefined)?.averageRating ??
        (data.ReviewSummary as Record<string, unknown> | undefined)?.AverageRating ??
        0
    ),
    reviewCount: Number(
      (data.reviewSummary as Record<string, unknown> | undefined)?.reviewCount ??
        (data.reviewSummary as Record<string, unknown> | undefined)?.ReviewCount ??
        (data.ReviewSummary as Record<string, unknown> | undefined)?.reviewCount ??
        (data.ReviewSummary as Record<string, unknown> | undefined)?.ReviewCount ??
        0
    ),
  },
  activeJobPostsCount: Number(data.activeJobPostsCount ?? data.ActiveJobPostsCount ?? 0),
});

const normalizePublicProfile = (data: Record<string, unknown>): EmployerPublicProfile => ({
  employerId: String(data.employerId ?? data.EmployerId ?? ""),
  publicSlug: String(data.publicSlug ?? data.PublicSlug ?? ""),
  name: String(data.name ?? data.Name ?? ""),
  profilePhoto: (data.profilePhoto ?? data.ProfilePhoto) as string | undefined,
  phoneNumber: String(data.phoneNumber ?? data.PhoneNumber ?? ""),
  isFavourite: (data.isFavourite ?? data.IsFavourite) as boolean | undefined,
  locations: (data.locations ?? data.Locations ?? []) as EmployerPublicProfile["locations"],
  reviewSummary: {
    averageRating: Number(
      (data.reviewSummary as Record<string, unknown> | undefined)?.averageRating ??
        (data.reviewSummary as Record<string, unknown> | undefined)?.AverageRating ??
        (data.ReviewSummary as Record<string, unknown> | undefined)?.averageRating ??
        (data.ReviewSummary as Record<string, unknown> | undefined)?.AverageRating ??
        0
    ),
    reviewCount: Number(
      (data.reviewSummary as Record<string, unknown> | undefined)?.reviewCount ??
        (data.reviewSummary as Record<string, unknown> | undefined)?.ReviewCount ??
        (data.ReviewSummary as Record<string, unknown> | undefined)?.reviewCount ??
        (data.ReviewSummary as Record<string, unknown> | undefined)?.ReviewCount ??
        0
    ),
  },
  activeJobPosts: (data.activeJobPosts ?? data.ActiveJobPosts ?? []) as EmployerPublicProfile["activeJobPosts"],
});

export const GetEmployerPublicProfileBySlug = async (
  slug: string
): Promise<AxiosResponse<EmployerPublicProfile>> => {
  const response = await axiosInstance.get(`/api/v1/EmployerProfile/slug/${encodeURIComponent(slug)}`);
  return {
    ...response,
    data: normalizePublicProfile(response.data as Record<string, unknown>),
  };
};

export const GetEmployerDirectoryPreviewBySlug = async (
  slug: string
): Promise<AxiosResponse<EmployerDirectoryPreview>> => {
  const response = await axiosInstance.get(
    `/api/v1/EmployerProfile/preview/slug/${encodeURIComponent(slug)}`
  );
  return {
    ...response,
    data: normalizeDirectoryPreview(response.data as Record<string, unknown>),
  };
};

export const ResolveEmployerSlug = async (
  employerId: string
): Promise<AxiosResponse<{ slug: string }>> => {
  return axiosInstance.get<{ slug: string }>(`/api/v1/EmployerProfile/${employerId}/slug`);
};

export const ResolveEmployerFromSlug = async (
  slug: string,
  role: string | undefined,
  ownEmployer?: { id: string; name: string; publicSlug?: string }
): Promise<{ employerId: string; name: string }> => {
  const normalizedSlug = slug.trim().toLowerCase();
  const ownSlug = ownEmployer?.publicSlug?.trim().toLowerCase();

  if (
    role === "Employer" &&
    ownEmployer &&
    ownSlug &&
    normalizedSlug === ownSlug
  ) {
    return {
      employerId: ownEmployer.id,
      name: ownEmployer.name,
    };
  }

  if (role === "Employer") {
    const response = await GetEmployerDirectoryPreviewBySlug(slug);
    return {
      employerId: response.data.employerId,
      name: response.data.name,
    };
  }

  const response = await GetEmployerPublicProfileBySlug(slug);
  return {
    employerId: response.data.employerId,
    name: response.data.name,
  };
};

/** @deprecated Use slug-based endpoints instead */
export const GetEmployerPublicProfile = async (
  employerId: string
): Promise<AxiosResponse<EmployerPublicProfile>> => {
  return axiosInstance.get<EmployerPublicProfile>(`/api/v1/EmployerProfile/${employerId}`);
};

/** @deprecated Use slug-based endpoints instead */
export const GetEmployerDirectoryPreview = async (
  employerId: string
): Promise<AxiosResponse<EmployerDirectoryPreview>> => {
  const response = await axiosInstance.get(`/api/v1/EmployerProfile/${employerId}/preview`);
  return {
    ...response,
    data: normalizeDirectoryPreview(response.data as Record<string, unknown>),
  };
};
