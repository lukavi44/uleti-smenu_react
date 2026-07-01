import {
  CalendarDaysIcon,
  HandThumbUpIcon,
  StarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { RichReviewSummary } from "../../models/RichReview.model";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import styles from "./RestaurantReviewsSummary.module.scss";

interface RestaurantReviewsSummaryProps {
  summary: RichReviewSummary;
  variant?: "desktop" | "mobile";
}

const RestaurantReviewsSummary = ({ summary, variant = "desktop" }: RestaurantReviewsSummaryProps) => {
  const { t } = useTranslation();
  const lastReviewLabel = summary.lastReviewAtUtc
    ? formatDisplayDate(summary.lastReviewAtUtc)
    : "—";

  return (
    <section className={`${styles.card} ${variant === "mobile" ? styles.cardMobile : ""}`}>
      <div className={styles.item}>
        <StarIcon className={`${styles.icon} ${styles.iconOrange}`} aria-hidden />
        <div>
          <strong>{summary.reviewCount > 0 ? summary.averageRating.toFixed(1) : "—"}</strong>
          <span>{t("restaurantReviews.averageRating")}</span>
        </div>
      </div>
      <div className={styles.item}>
        <UserGroupIcon className={`${styles.icon} ${styles.iconBlue}`} aria-hidden />
        <div>
          <strong>{summary.reviewCount}</strong>
          <span>{t("restaurantReviews.totalReviews")}</span>
        </div>
      </div>
      <div className={styles.item}>
        <HandThumbUpIcon className={`${styles.icon} ${styles.iconGreen}`} aria-hidden />
        <div>
          <strong>{summary.recommendationsCount}</strong>
          <span>{t("restaurantReviews.recommendations")}</span>
        </div>
      </div>
      <div className={styles.item}>
        <CalendarDaysIcon className={`${styles.icon} ${styles.iconPurple}`} aria-hidden />
        <div>
          <strong>{lastReviewLabel}</strong>
          <span>{t("restaurantReviews.lastReview")}</span>
        </div>
      </div>
    </section>
  );
};

export default RestaurantReviewsSummary;
