import { EmployerDashboardSummary } from "../models/EmployerDashboardSummary.model";
import { JobPost } from "../models/JobPost.model";

export const normalizeEmployerDashboardSummary = (
  data: Record<string, unknown>
): EmployerDashboardSummary => ({
  activeJobPostsCount: Number(
    data.activeJobPostsCount ?? data.ActiveJobPostsCount ?? 0
  ),
  pendingApplicantsCount: Number(
    data.pendingApplicantsCount ??
      data.PendingApplicantsCount ??
      data.totalApplicantsCount ??
      data.TotalApplicantsCount ??
      0
  ),
  activePostsByLocationId: (data.activePostsByLocationId ??
    data.ActivePostsByLocationId ??
    {}) as Record<string, number>,
});

export const buildEmployerDashboardSummaryFromPosts = (
  posts: JobPost[],
  activeJobPostsCount: number
): EmployerDashboardSummary => {
  const activePostsByLocationId: Record<string, number> = {};

  posts.forEach((post) => {
    if (post.isArchived || !post.restaurantLocationId) {
      return;
    }

    activePostsByLocationId[post.restaurantLocationId] =
      (activePostsByLocationId[post.restaurantLocationId] ?? 0) + 1;
  });

  return {
    activeJobPostsCount,
    pendingApplicantsCount: 0,
    activePostsByLocationId,
  };
};

export const buildApplicantCountsFromPosts = (posts: JobPost[]) => {
  const applicantCountsByPostId: Record<string, number> = {};

  posts.forEach((post) => {
    applicantCountsByPostId[post.id] = post.applicantCount ?? 0;
  });

  return applicantCountsByPostId;
};
