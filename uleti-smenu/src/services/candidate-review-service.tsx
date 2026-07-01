import { AxiosResponse } from "axios";
import { RichReviewItem, RichReviewSummary, ReviewSort } from "../models/RichReview.model";
import axiosInstance from "./axiosConfig";

const normalizeSummary = (data: Record<string, unknown>): RichReviewSummary => ({
  subjectName: String(
    data.candidateName ?? data.CandidateName ?? data.subjectName ?? data.SubjectName ?? ""
  ),
  averageRating: Number(data.averageRating ?? data.AverageRating ?? 0),
  reviewCount: Number(data.reviewCount ?? data.ReviewCount ?? 0),
  recommendationsCount: Number(data.recommendationsCount ?? data.RecommendationsCount ?? 0),
  lastReviewAtUtc: (data.lastReviewAtUtc ?? data.LastReviewAtUtc) as string | undefined,
});

const normalizeReview = (data: Record<string, unknown>): RichReviewItem => ({
  id: String(data.id ?? data.Id ?? ""),
  reviewerName: String(data.reviewerName ?? data.ReviewerName ?? ""),
  reviewerProfilePhoto: (() => {
    const value = String(data.reviewerProfilePhoto ?? data.ReviewerProfilePhoto ?? "").trim();
    return value || undefined;
  })(),
  reviewerIsVerified: Boolean(data.reviewerIsVerified ?? data.ReviewerIsVerified ?? false),
  rating: Number(data.rating ?? data.Rating ?? 0),
  comment: (data.comment ?? data.Comment) as string | undefined,
  contextLabel: String(data.jobPostTitle ?? data.JobPostTitle ?? "") || undefined,
  createdAtUtc: String(data.createdAtUtc ?? data.CreatedAtUtc ?? ""),
  recommends: Boolean(data.recommends ?? data.Recommends ?? false),
});

export const GetCandidateReviewsSummary = async (
  employeeId: string
): Promise<AxiosResponse<RichReviewSummary>> => {
  const response = await axiosInstance.get(
    `/api/v1/EmployeeProfile/${employeeId}/reviews/summary`
  );
  return {
    ...response,
    data: normalizeSummary(response.data as Record<string, unknown>),
  };
};

export const GetCandidateReviews = async (
  employeeId: string,
  page: number,
  pageSize: number,
  sort: ReviewSort
): Promise<AxiosResponse<{ items: RichReviewItem[]; totalCount: number }>> => {
  const response = await axiosInstance.get(`/api/v1/EmployeeProfile/${employeeId}/reviews`, {
    params: { page, pageSize, sort },
  });
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
