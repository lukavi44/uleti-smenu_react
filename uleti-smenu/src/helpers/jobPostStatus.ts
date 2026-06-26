export const getJobPostStatusLabel = (
  status: string,
  t: (key: string) => string
): string => {
  switch (status) {
    case "Draft":
      return t("jobPostForm.statusDraft");
    case "Active":
      return t("jobPostForm.statusActive");
    case "Expired":
      return t("jobPostForm.statusExpired");
    case "Cancelled":
      return t("jobPostForm.statusCancelled");
    case "Completed":
      return t("jobPostForm.statusCompleted");
    default:
      return status;
  }
};

export const getJobPostDisplayStatusLabel = (
  post: { status: string; isArchived?: boolean },
  t: (key: string) => string
): string => {
  if (post.isArchived) {
    return t("jobPosts.lifecycleArchived");
  }

  return getJobPostStatusLabel(post.status, t);
};
