import { Applicant } from "../models/Application.model";
import { JobPost } from "../models/JobPost.model";
import { GetApplicantsForJobPost } from "../services/application-service";
import { GetMyJobPostsPaged } from "../services/jobPost-service";
import { canEmployerDecideOnApplication } from "./applicationStatus";

export type PendingApplicantItem = Applicant & {
  jobPostId: string;
  jobPostTitle: string;
  jobPostLocation: string;
};

const MAX_POSTS_TO_SCAN = 10;
const MAX_PENDING = 12;

const formatPostLocation = (post: JobPost): string => {
  if (!post.restaurantLocationName) {
    return post.restaurantLocationCity || "-";
  }

  return post.restaurantLocationCity
    ? `${post.restaurantLocationName} (${post.restaurantLocationCity})`
    : post.restaurantLocationName;
};

export const loadPendingApplicantsForDashboard = async (): Promise<PendingApplicantItem[]> => {
  const postsResponse = await GetMyJobPostsPaged({
    page: 1,
    pageSize: MAX_POSTS_TO_SCAN,
    hasApplicants: true,
    sortBy: "applicantCount",
    sortDirection: "desc",
  });

  const posts = postsResponse.data.items;
  const applicantResults = await Promise.all(
    posts.map(async (post) => {
      try {
        const response = await GetApplicantsForJobPost(post.id);
        return { post, applicants: response.data };
      } catch {
        return { post, applicants: [] as Applicant[] };
      }
    })
  );

  const pending: PendingApplicantItem[] = [];

  applicantResults.forEach(({ post, applicants }) => {
    applicants.forEach((applicant) => {
      if (!canEmployerDecideOnApplication(applicant.status)) {
        return;
      }

      pending.push({
        ...applicant,
        jobPostId: post.id,
        jobPostTitle: post.title,
        jobPostLocation: formatPostLocation(post),
      });
    });
  });

  pending.sort((first, second) => new Date(second.appliedAt).getTime() - new Date(first.appliedAt).getTime());

  return pending.slice(0, MAX_PENDING);
};
