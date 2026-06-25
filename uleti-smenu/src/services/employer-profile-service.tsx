import axios, { AxiosResponse } from "axios";
import { EmployerDirectoryPreview } from "../models/EmployerDirectoryPreview.model";
import { EmployerPublicProfile } from "../models/EmployerPublicProfile.model";
import { PagedResult } from "../models/PagedResult.model";
import { Employer } from "../models/User.model";
import axiosInstance from "./axiosConfig";
import { GetVisibleJobPostsPaged } from "./jobPost-service";
import { GetAllEmployers, GetEmployersWithFavouriteStatus } from "./user-service";

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
  isFavourite: Boolean(data.isFavourite ?? data.IsFavourite ?? false),
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

export interface GetEmployerDirectoryParams {
  page: number;
  pageSize: number;
  city?: string;
  search?: string;
}

const mapEmployerToDirectoryPreview = (employer: Employer): EmployerDirectoryPreview => ({
  employerId: employer.id,
  publicSlug: employer.publicSlug ?? "",
  name: employer.name,
  profilePhoto: employer.profilePhoto,
  city: "",
  reviewSummary: {
    averageRating: 0,
    reviewCount: 0,
  },
  activeJobPostsCount: 0,
  isFavourite: employer.isFavourite,
});

const fetchEmployersForDirectoryFallback = async (city?: string): Promise<Employer[]> => {
  try {
    const response = await GetEmployersWithFavouriteStatus(city);
    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      const response = await GetAllEmployers(city);
      return response.data;
    }

    throw error;
  }
};

type EmployerDirectoryStats = {
  activeJobPostsCount: number;
  city: string;
};

const loadEmployerDirectoryStats = async (
  cityFilter?: string
): Promise<Map<string, EmployerDirectoryStats>> => {
  const stats = new Map<string, { count: number; cities: Set<string> }>();
  const pageSize = 100;
  let page = 1;
  let totalCount = 0;

  do {
    const response = await GetVisibleJobPostsPaged({
      page,
      pageSize,
      city: cityFilter || undefined,
    });
    totalCount = response.data.totalCount;

    for (const jobPost of response.data.items) {
      const employerId = String(jobPost.employerId ?? "");
      if (!employerId) {
        continue;
      }

      const current = stats.get(employerId) ?? { count: 0, cities: new Set<string>() };
      current.count += 1;

      const locationCity = jobPost.restaurantLocationCity?.trim();
      if (locationCity) {
        current.cities.add(locationCity);
      }

      stats.set(employerId, current);
    }

    page += 1;
  } while ((page - 1) * pageSize < totalCount);

  return new Map(
    [...stats.entries()].map(([employerId, value]) => [
      employerId,
      {
        activeJobPostsCount: value.count,
        city: [...value.cities].sort((left, right) => left.localeCompare(right)).join(", "),
      },
    ])
  );
};

const enrichDirectoryFallbackItems = async (
  items: EmployerDirectoryPreview[],
  cityFilter?: string
): Promise<EmployerDirectoryPreview[]> => {
  if (items.length === 0) {
    return items;
  }

  try {
    const stats = await loadEmployerDirectoryStats(cityFilter);
    return items.map((item) => {
      const employerStats = stats.get(item.employerId);
      if (!employerStats) {
        return item;
      }

      return {
        ...item,
        city: employerStats.city || item.city,
        activeJobPostsCount: employerStats.activeJobPostsCount,
      };
    });
  } catch {
    return items;
  }
};

const getEmployerDirectoryPagedFallback = async (
  params: GetEmployerDirectoryParams
): Promise<AxiosResponse<PagedResult<EmployerDirectoryPreview>>> => {
  let employers = await fetchEmployersForDirectoryFallback(params.city);

  if (params.search?.trim()) {
    const normalizedSearch = params.search.trim().toLowerCase();
    employers = employers.filter((employer) =>
      employer.name.toLowerCase().includes(normalizedSearch)
    );
  }

  employers = [...employers].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  );

  const totalCount = employers.length;
  const start = (params.page - 1) * params.pageSize;
  const pageEmployers = employers.slice(start, start + params.pageSize);
  const items = await enrichDirectoryFallbackItems(
    pageEmployers.map(mapEmployerToDirectoryPreview),
    params.city
  );

  return {
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as AxiosResponse<PagedResult<EmployerDirectoryPreview>>["config"],
    data: {
      items,
      totalCount,
      page: params.page,
      pageSize: params.pageSize,
    },
  };
};

const normalizeDirectoryPagedResponse = (
  response: AxiosResponse,
  params: GetEmployerDirectoryParams
): AxiosResponse<PagedResult<EmployerDirectoryPreview>> => {
  const paged = response.data as PagedResult<EmployerDirectoryPreview> & {
    Items?: EmployerDirectoryPreview[];
    TotalCount?: number;
    Page?: number;
    PageSize?: number;
  };

  return {
    ...response,
    data: {
      items: (paged.items ?? paged.Items ?? []).map((item) =>
        normalizeDirectoryPreview(item as unknown as Record<string, unknown>)
      ),
      totalCount: paged.totalCount ?? paged.TotalCount ?? 0,
      page: paged.page ?? paged.Page ?? params.page,
      pageSize: paged.pageSize ?? paged.PageSize ?? params.pageSize,
    },
  };
};

export const GetEmployerDirectoryPaged = async (
  params: GetEmployerDirectoryParams
): Promise<AxiosResponse<PagedResult<EmployerDirectoryPreview>>> => {
  const directoryParams = {
    page: params.page,
    pageSize: params.pageSize,
    city: params.city || undefined,
    search: params.search || undefined,
  };

  const directoryEndpoints = [
    "/api/v1/EmployerProfile/directory",
    "/api/v1/User/employers/directory",
  ];

  for (const endpoint of directoryEndpoints) {
    try {
      const response = await axiosInstance.get(endpoint, { params: directoryParams });
      return normalizeDirectoryPagedResponse(response, params);
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  return getEmployerDirectoryPagedFallback(params);
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
