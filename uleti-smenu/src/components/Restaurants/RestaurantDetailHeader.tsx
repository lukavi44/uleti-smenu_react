import {
  BriefcaseIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  MapPinIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { ReviewSummary } from "../../models/Review.model";
import styles from "./RestaurantDetailHeader.module.scss";

interface RestaurantDetailHeaderProps {
  name: string;
  profilePhoto?: string;
  city?: string;
  memberSince?: string;
  isVerified?: boolean;
  reviewSummary: ReviewSummary;
  activeJobPostsCount: number;
  locationsCount: number;
  reviewsHref?: string;
  isFavourite?: boolean;
  favouriteInProgress?: boolean;
  onToggleFavourite?: () => void;
}

const formatMemberSince = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString();
};

const RestaurantDetailHeader = ({
  name,
  profilePhoto,
  city,
  memberSince,
  isVerified = false,
  reviewSummary,
  activeJobPostsCount,
  locationsCount,
  reviewsHref,
  isFavourite = false,
  favouriteInProgress = false,
  onToggleFavourite,
}: RestaurantDetailHeaderProps) => {
  const { t } = useTranslation();
  const memberSinceLabel = formatMemberSince(memberSince);
  const showFavourite = Boolean(onToggleFavourite);
  const ratingValue =
    reviewSummary.reviewCount > 0
      ? reviewSummary.averageRating.toFixed(1)
      : t("employeeProfile.experienceUnavailable");
  const reviewCountLabel =
    reviewSummary.reviewCount > 0
      ? String(reviewSummary.reviewCount)
      : t("employeeProfile.experienceUnavailable");

  const favouriteButton = showFavourite ? (
    <button
      type="button"
      className={`${styles.favouriteBtn} ${isFavourite ? styles.favouriteBtnActive : ""}`}
      aria-label={
        isFavourite ? t("employers.removeFromFavorites") : t("employers.addToFavorites")
      }
      disabled={favouriteInProgress}
      onClick={onToggleFavourite}
    >
      {isFavourite ? (
        <StarIconSolid className={styles.favouriteIcon} aria-hidden="true" />
      ) : (
        <StarIcon className={styles.favouriteIcon} aria-hidden="true" />
      )}
    </button>
  ) : null;

  return (
    <section className={styles.card}>
      <div className={styles.profileRow}>
        <div className={styles.photoWrap}>
          <img src={getImageUrl(profilePhoto)} alt={name} className={styles.photo} />
          {showFavourite ? <span className={styles.favouriteDesktop}>{favouriteButton}</span> : null}
        </div>

        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{name}</h1>
            {isVerified ? (
              <CheckBadgeIcon className={styles.verifiedIcon} aria-hidden="true" />
            ) : null}
            {showFavourite ? <span className={styles.favouriteMobile}>{favouriteButton}</span> : null}
          </div>

          {reviewSummary.reviewCount > 0 && reviewsHref ? (
            <Link to={reviewsHref} className={styles.ratingLine}>
              <StarIcon className={styles.ratingIcon} aria-hidden="true" />
              {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.reviewCount})
            </Link>
          ) : reviewSummary.reviewCount > 0 ? (
            <p className={styles.ratingLine}>
              <StarIcon className={styles.ratingIcon} aria-hidden="true" />
              {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.reviewCount})
            </p>
          ) : reviewsHref ? (
            <Link to={reviewsHref} className={styles.reviewsLink}>
              {t("employerProfile.viewReviews")}
            </Link>
          ) : null}

          {city ? (
            <p className={styles.metaLine}>
              <MapPinIcon className={styles.metaIcon} aria-hidden="true" />
              {city}
            </p>
          ) : null}

          {memberSinceLabel ? (
            <p className={styles.metaLine}>
              <CalendarDaysIcon className={styles.metaIcon} aria-hidden="true" />
              {t("employerProfile.memberSince", { date: memberSinceLabel })}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <StarIcon className={`${styles.statIcon} ${styles.statIconOrange}`} aria-hidden="true" />
          <strong className={styles.statValue}>{ratingValue}</strong>
          <span className={styles.statLabel}>{t("employerProfile.statAverageRating")}</span>
        </article>

        <article className={styles.statCard}>
          <ChatBubbleLeftRightIcon
            className={`${styles.statIcon} ${styles.statIconBlue}`}
            aria-hidden="true"
          />
          <strong className={styles.statValue}>{reviewCountLabel}</strong>
          <span className={styles.statLabel}>{t("employerProfile.statReviewCount")}</span>
        </article>

        <article className={styles.statCard}>
          <BriefcaseIcon className={`${styles.statIcon} ${styles.statIconBlue}`} aria-hidden="true" />
          <strong className={styles.statValue}>{activeJobPostsCount}</strong>
          <span className={styles.statLabel}>{t("employerProfile.statActiveJobPosts")}</span>
        </article>

        <article className={styles.statCard}>
          <BuildingStorefrontIcon
            className={`${styles.statIcon} ${styles.statIconGreen}`}
            aria-hidden="true"
          />
          <strong className={styles.statValue}>{locationsCount}</strong>
          <span className={styles.statLabel}>{t("employerProfile.statLocations")}</span>
        </article>
      </div>
    </section>
  );
};

export default RestaurantDetailHeader;
