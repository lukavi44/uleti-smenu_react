import { Review } from "../../models/Review.model";
import styles from "./CandidateReviewList.module.scss";

interface CandidateReviewListProps {
  reviews: Review[];
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const CandidateReviewList = ({ reviews }: CandidateReviewListProps) => (
  <div className={styles.list}>
    {reviews.map((review) => (
      <article key={review.id} className={styles.card}>
        <div className={styles.avatar} aria-hidden="true">
          {getInitials(review.reviewerName)}
        </div>
        <div className={styles.body}>
          <div className={styles.topRow}>
            <div className={styles.titleBlock}>
              <strong className={styles.reviewerName}>{review.reviewerName}</strong>
              <p className={styles.jobTitle}>{review.jobPostTitle}</p>
            </div>
            <span className={styles.stars} aria-label={`${review.rating} stars`}>
              {"★".repeat(review.rating)}
            </span>
          </div>
          {review.comment && <p className={styles.comment}>{review.comment}</p>}
          <time className={styles.date} dateTime={review.createdAtUtc}>
            {new Date(review.createdAtUtc).toLocaleString()}
          </time>
        </div>
      </article>
    ))}
  </div>
);

export default CandidateReviewList;
