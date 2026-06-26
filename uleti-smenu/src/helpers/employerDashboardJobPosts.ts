import { TFunction } from "i18next";
import { JobPost } from "../models/JobPost.model";

export type EmployerDashboardJobTab = "active" | "draft" | "inactive";

export const categorizeEmployerDashboardJobPost = (post: JobPost): EmployerDashboardJobTab => {
  if (post.isArchived || post.status === "Cancelled" || post.status === "Expired") {
    return "inactive";
  }

  if (post.status === "Draft") {
    return "draft";
  }

  return "active";
};

export const filterEmployerDashboardJobPosts = (
  posts: JobPost[],
  tab: EmployerDashboardJobTab
): JobPost[] => posts.filter((post) => categorizeEmployerDashboardJobPost(post) === tab);

export const countEmployerDashboardJobPostsByTab = (posts: JobPost[]) => ({
  active: filterEmployerDashboardJobPosts(posts, "active").length,
  draft: filterEmployerDashboardJobPosts(posts, "draft").length,
  inactive: filterEmployerDashboardJobPosts(posts, "inactive").length,
});

export type DashboardJobStatusVariant = "active" | "pending" | "inactive";

export const getEmployerDashboardJobStatusBadge = (
  post: JobPost,
  t: TFunction
): { label: string; variant: DashboardJobStatusVariant } => {
  const tab = categorizeEmployerDashboardJobPost(post);

  if (tab === "active") {
    return { label: t("home.dashboard.statusActive"), variant: "active" };
  }

  if (tab === "draft") {
    return { label: t("home.dashboard.statusPending"), variant: "pending" };
  }

  return { label: t("home.dashboard.statusInactive"), variant: "inactive" };
};

export const getJobPostPublishedDate = (post: JobPost): string => {
  const extendedPost = post as JobPost & { createdAt?: string };
  return String(extendedPost.createdAt ?? post.startingDate);
};
