import { Review } from "../../models/Review.model";
import styles from "./ReviewList.module.scss";
import { useTranslation } from "react-i18next";

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList = ({ reviews }: ReviewListProps) => {
  const { t } = useTranslation();

  if (reviews.length === 0) {
    return <p className={styles.mutedText}>{t("reviews.noReviews")}</p>;
  }

  return (
    <div className={styles.list}>
      {reviews.map((review) => (
        <article key={review.id} className={styles.card}>
          <div className={styles.header}>
            <strong>{review.reviewerName}</strong>
            <span className={styles.rating}>{"★".repeat(review.rating)}</span>
          </div>
          <p className={styles.meta}>{review.jobPostTitle}</p>
          {review.comment && <p className={styles.comment}>{review.comment}</p>}
          <small className={styles.date}>{new Date(review.createdAtUtc).toLocaleString()}</small>
        </article>
      ))}
    </div>
  );
};

export default ReviewList;
