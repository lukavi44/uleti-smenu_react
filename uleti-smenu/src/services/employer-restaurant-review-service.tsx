import { AxiosResponse } from "axios";
import {
  EmployerRestaurantReview,
  EmployerRestaurantReviewSort,
  EmployerRestaurantReviewSummary,
} from "../models/EmployerRestaurantReview.model";
import axiosInstance from "./axiosConfig";

const normalizeSummary = (data: Record<string, unknown>): EmployerRestaurantReviewSummary => ({
  subjectName: String(
    data.restaurantName ?? data.RestaurantName ?? data.subjectName ?? data.SubjectName ?? ""
  ),
  averageRating: Number(data.averageRating ?? data.AverageRating ?? 0),
  reviewCount: Number(data.reviewCount ?? data.ReviewCount ?? 0),
  recommendationsCount: Number(data.recommendationsCount ?? data.RecommendationsCount ?? 0),
  lastReviewAtUtc: (data.lastReviewAtUtc ?? data.LastReviewAtUtc) as string | undefined,
});

const normalizeReview = (data: Record<string, unknown>): EmployerRestaurantReview => ({
  id: String(data.id ?? data.Id ?? ""),
  applicationId: String(data.applicationId ?? data.ApplicationId ?? ""),
  reviewerId: String(data.reviewerId ?? data.ReviewerId ?? ""),
  reviewerName: String(data.reviewerName ?? data.ReviewerName ?? ""),
  reviewerProfilePhoto: (() => {
    const value = String(data.reviewerProfilePhoto ?? data.ReviewerProfilePhoto ?? "").trim();
    return value || undefined;
  })(),
  rating: Number(data.rating ?? data.Rating ?? 0),
  comment: (data.comment ?? data.Comment) as string | undefined,
  createdAtUtc: String(data.createdAtUtc ?? data.CreatedAtUtc ?? ""),
  recommends: Boolean(data.recommends ?? data.Recommends ?? false),
});

export const GetEmployerRestaurantReviewsSummary = async (
  slug: string
): Promise<AxiosResponse<EmployerRestaurantReviewSummary>> => {
  const response = await axiosInstance.get(
    `/api/v1/EmployerProfile/slug/${encodeURIComponent(slug)}/reviews/summary`
  );
  return {
    ...response,
    data: normalizeSummary(response.data as Record<string, unknown>),
  };
};

export const GetEmployerRestaurantReviews = async (
  slug: string,
  page: number,
  pageSize: number,
  sort: EmployerRestaurantReviewSort
): Promise<AxiosResponse<{ items: EmployerRestaurantReview[]; totalCount: number }>> => {
  const response = await axiosInstance.get(
    `/api/v1/EmployerProfile/slug/${encodeURIComponent(slug)}/reviews`,
    { params: { page, pageSize, sort } }
  );
  const payload = response.data as Record<string, unknown>;
  const items = (payload.items ?? payload.Items ?? []) as Record<string, unknown>[];

  return {
    ...response,
    data: {
      items: items.map((item) => normalizeReview(item)),
      totalCount: Number(payload.totalCount ?? payload.TotalCount ?? 0),
    },
  };
};
