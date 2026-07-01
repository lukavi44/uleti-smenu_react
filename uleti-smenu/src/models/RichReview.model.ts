export type ReviewSort = "newest" | "highest" | "lowest";

export interface RichReviewSummary {
  subjectName: string;
  averageRating: number;
  reviewCount: number;
  recommendationsCount: number;
  lastReviewAtUtc?: string;
}

export interface RichReviewItem {
  id: string;
  reviewerName: string;
  reviewerProfilePhoto?: string;
  reviewerIsVerified?: boolean;
  rating: number;
  comment?: string;
  contextLabel?: string;
  createdAtUtc: string;
  recommends: boolean;
}

// Backward-compatible aliases for restaurant reviews
export type EmployerRestaurantReviewSummary = RichReviewSummary & { restaurantName?: string };
export type EmployerRestaurantReview = RichReviewItem & {
  applicationId?: string;
  reviewerId?: string;
};
export type EmployerRestaurantReviewSort = ReviewSort;
