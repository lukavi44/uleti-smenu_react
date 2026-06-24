import { ReviewSummary } from "./Review.model";

export interface EmployerDirectoryPreview {
  employerId: string;
  publicSlug: string;
  name: string;
  profilePhoto?: string;
  city: string;
  reviewSummary: ReviewSummary;
  activeJobPostsCount: number;
}
