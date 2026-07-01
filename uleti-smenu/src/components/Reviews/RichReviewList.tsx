import {
  CalendarDaysIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import ChatContactAvatar from "../Chat/ChatContactAvatar";
import { RichReviewItem } from "../../models/RichReview.model";
import { formatReviewDateTime } from "../../helpers/formatReviewDateTime";
import styles from "./RichReviewList.module.scss";

interface RichReviewListProps {
  reviews: RichReviewItem[];
  recommendsLabelKey?: string;
  verifiedBadgeMode?: "always" | "whenVerified";
}

const renderStars = (rating: number) => (
  <span className={styles.stars} aria-label={`${rating} / 5`}>
    <span className={styles.starFilled}>{"★".repeat(rating)}</span>
    <span className={styles.starEmpty}>{"★".repeat(Math.max(0, 5 - rating))}</span>
  </span>
);

const RichReviewList = ({
  reviews,
  recommendsLabelKey = "restaurantReviews.recommends",
  verifiedBadgeMode = "always",
}: RichReviewListProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:1023px)");

  return (
    <div className={styles.list}>
      {reviews.map((review) => (
        <article key={review.id} className={styles.card}>
          <div className={styles.main}>
            <ChatContactAvatar
              name={review.reviewerName}
              profilePhoto={review.reviewerProfilePhoto}
              size="md"
            />

            <div className={styles.body}>
              <div className={styles.nameRow}>
                <strong>{review.reviewerName}</strong>
                {verifiedBadgeMode === "always" || review.reviewerIsVerified ? (
                  <CheckBadgeIcon className={styles.verifiedIcon} aria-hidden />
                ) : null}
              </div>

              {review.contextLabel && <p className={styles.contextLabel}>{review.contextLabel}</p>}

              <div className={styles.ratingRow}>
                {renderStars(review.rating)}
                <span className={styles.ratingValue}>{review.rating.toFixed(1)}</span>
              </div>

              {review.comment && <p className={styles.comment}>{review.comment}</p>}
            </div>

            <div className={styles.meta}>
              <p className={styles.date}>
                <CalendarDaysIcon className={styles.dateIcon} aria-hidden />
                <time dateTime={review.createdAtUtc}>
                  {formatReviewDateTime(review.createdAtUtc, isMobile)}
                </time>
              </p>

              {review.recommends && (
                <span className={styles.recommendBadge}>{t(recommendsLabelKey)}</span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default RichReviewList;
