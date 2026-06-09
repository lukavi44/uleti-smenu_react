export interface Review {
  id: string;
  applicationId: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  jobPostTitle: string;
  createdAtUtc: string;
}

export interface PendingReview {
  applicationId: string;
  jobPostId: string;
  jobPostTitle: string;
  revieweeId: string;
  revieweeName: string;
  shiftDate: string;
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
}

export interface SubmitReviewPayload {
  applicationId: string;
  rating: number;
  comment?: string;
}
