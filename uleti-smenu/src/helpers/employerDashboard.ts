import { EmployerDashboardSummary } from "../models/EmployerDashboardSummary.model";
import { JobPost } from "../models/JobPost.model";

export const normalizeEmployerDashboardSummary = (
  data: Record<string, unknown>
): EmployerDashboardSummary => ({
  activeJobPostsCount: Number(
    data.activeJobPostsCount ?? data.ActiveJobPostsCount ?? 0
  ),
  totalApplicantsCount: Number(
    data.totalApplicantsCount ?? data.TotalApplicantsCount ?? 0
  ),
  activePostsByLocationId: (data.activePostsByLocationId ??
    data.ActivePostsByLocationId ??
    {}) as Record<string, number>,
});

export const buildEmployerDashboardSummaryFromPosts = (
  posts: JobPost[],
  activeJobPostsCount: number,
  applicantCountsByPostId: Record<string, number>
): EmployerDashboardSummary => {
  const activePostsByLocationId: Record<string, number> = {};

  posts.forEach((post) => {
    if (post.isArchived || !post.restaurantLocationId) {
      return;
    }

    activePostsByLocationId[post.restaurantLocationId] =
      (activePostsByLocationId[post.restaurantLocationId] ?? 0) + 1;
  });

  const totalApplicantsCount = Object.values(applicantCountsByPostId).reduce(
    (sum, count) => sum + count,
    0
  );

  return {
    activeJobPostsCount,
    totalApplicantsCount,
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
