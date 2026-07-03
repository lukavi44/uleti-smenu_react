import { Review, ReviewPage } from "../models/Review.model";
import { RichReviewItem, RichReviewSummary } from "../models/RichReview.model";

export const mapReviewToRichItem = (review: Review): RichReviewItem => ({
  id: review.id,
  reviewerName: review.reviewerName,
  rating: review.rating,
  comment: review.comment,
  contextLabel: review.jobPostTitle,
  createdAtUtc: review.createdAtUtc,
  recommends: review.rating >= 4,
});

export const mapReviewPageToRichSummary = (page: ReviewPage): RichReviewSummary => {
  const sortedReviews = [...page.reviews].sort(
    (first, second) => new Date(second.createdAtUtc).getTime() - new Date(first.createdAtUtc).getTime()
  );

  return {
    subjectName: page.subjectName,
    averageRating: page.summary.averageRating,
    reviewCount: page.summary.reviewCount,
    recommendationsCount: page.reviews.filter((review) => review.rating >= 4).length,
    lastReviewAtUtc: sortedReviews[0]?.createdAtUtc,
  };
};

export const sortRichReviews = (
  reviews: RichReviewItem[],
  sort: "newest" | "highest" | "lowest"
): RichReviewItem[] => {
  const sorted = [...reviews];

  if (sort === "highest") {
    return sorted.sort((first, second) => second.rating - first.rating);
  }

  if (sort === "lowest") {
    return sorted.sort((first, second) => first.rating - second.rating);
  }

  return sorted.sort(
    (first, second) => new Date(second.createdAtUtc).getTime() - new Date(first.createdAtUtc).getTime()
  );
};
