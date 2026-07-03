import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Review, ReviewSummary } from "../../models/Review.model";
import { LIST_PAGE_SIZE } from "../../constants/pagination";
import { mapReviewToRichItem } from "../../helpers/mapReviewPageToRich";
import { useClientPagination } from "../../hooks/useClientPagination";
import Pagination from "../Common/Pagination";
import RichReviewList from "./RichReviewList";
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

  const richReviews = useMemo(() => pagedItems.map(mapReviewToRichItem), [pagedItems]);

  return (
    <div className={styles.section}>
      {reviewSummary.reviewCount > 0 && (
        <p className={styles.summary}>
          ★ {reviewSummary.averageRating.toFixed(1)} · {reviewSummary.reviewCount}{" "}
          {t("reviews.reviewCountLabel")}
        </p>
      )}
      {richReviews.length === 0 ? (
        <p className={styles.mutedText}>{t("reviews.noReviews")}</p>
      ) : (
        <RichReviewList reviews={richReviews} verifiedBadgeMode="whenVerified" />
      )}
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
