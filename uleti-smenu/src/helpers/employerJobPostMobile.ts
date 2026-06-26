import { TFunction } from "i18next";
import { JobPost } from "../models/JobPost.model";

export type JobPostStatusBadgeVariant = "active" | "closed";

export const getEmployerJobPostStatusBadge = (
  post: Pick<JobPost, "status" | "isArchived">,
  t: TFunction
): { label: string; variant: JobPostStatusBadgeVariant } => {
  if (post.status === "Draft") {
    return { label: t("jobPostForm.statusDraft").toUpperCase(), variant: "closed" };
  }

  if (post.isArchived || post.status === "Cancelled" || post.status === "Expired") {
    return { label: t("jobPosts.statusClosed"), variant: "closed" };
  }

  return { label: t("jobPosts.statusActiveUpper"), variant: "active" };
};

export const getApplicantStatusBadgeVariant = (
  status: string
): "accepted" | "pending" | "rejected" => {
  if (status === "Accepted") return "accepted";
  if (status === "Applied") return "pending";
  return "rejected";
};
