import { useTranslation } from "react-i18next";
import { Review, ReviewSummary } from "../../models/Review.model";
import { LIST_PAGE_SIZE } from "../../constants/pagination";
import { useClientPagination } from "../../hooks/useClientPagination";
import Pagination from "../Common/Pagination";
import ReviewList from "./ReviewList";
import styles from "./ReceivedReviewsSection.module.scss";

interface ReceivedReviewsSectionProps {
  reviews: Review[];
  reviewSummary: ReviewSummary;
}

const ReceivedReviewsSection = ({ reviews, reviewSummary }: ReceivedReviewsSectionProps) => {
  const { t } = useTranslation();
  const {
    page,
    setPage,
    totalPages,
    totalCount,
    pageSize,
    pagedItems,
  } = useClientPagination(reviews, LIST_PAGE_SIZE);

  return (
    <div className={styles.section}>
      {reviewSummary.reviewCount > 0 && (
        <p className={styles.summary}>
          ★ {reviewSummary.averageRating.toFixed(1)} · {reviewSummary.reviewCount}{" "}
          {t("reviews.reviewCountLabel")}
        </p>
      )}
      <ReviewList reviews={pagedItems} />
      {totalCount > LIST_PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPrevious={() => setPage((previous) => Math.max(1, previous - 1))}
          onNext={() => setPage((previous) => Math.min(totalPages, previous + 1))}
        />
      )}
    </div>
  );
};

export default ReceivedReviewsSection;
