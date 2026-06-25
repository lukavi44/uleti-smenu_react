import { Link, useNavigate } from "react-router-dom";
import { MapPinIcon, StarIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { EmployerDirectoryPreview } from "../../models/EmployerDirectoryPreview.model";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { getRestaurantProfilePath, getRestaurantReviewsPath } from "../../helpers/restaurantPaths";
import defaultHeroImage from "../../assets/restoran1.jpg";
import styles from "./RestaurantDirectoryCard.module.scss";

type RestaurantDirectoryCardProps = {
  restaurant: EmployerDirectoryPreview;
  canViewProfile: boolean;
  showJobPostsCount: boolean;
  myEmployerId?: string;
  role?: string;
};

const RestaurantDirectoryCard = ({
  restaurant,
  canViewProfile,
  showJobPostsCount,
  myEmployerId,
  role,
}: RestaurantDirectoryCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profilePath = getRestaurantProfilePath(
    {
      id: restaurant.employerId,
      publicSlug: restaurant.publicSlug,
    },
    { myId: myEmployerId, role }
  );
  const heroImage = getImageUrl(restaurant.profilePhoto) || defaultHeroImage;
  const logoImage = getImageUrl(restaurant.profilePhoto);
  const hasRating = restaurant.reviewSummary.reviewCount > 0;
  const cityLabel = restaurant.city || t("restaurants.unknownCity");
  const reviewsPath = getRestaurantReviewsPath({
    id: restaurant.employerId,
    publicSlug: restaurant.publicSlug,
  });

  const ratingContent = (
    <>
      <StarIcon className={styles.ratingIcon} aria-hidden="true" />
      <span>{restaurant.reviewSummary.averageRating.toFixed(1)}</span>
    </>
  );

  const cardContent = (
    <>
      <div className={styles.hero}>
        <img src={heroImage} alt="" className={styles.heroImage} />
      </div>
      <div className={styles.body}>
        <img src={logoImage} alt="" className={styles.logo} />
        <div className={styles.details}>
          <h3 className={styles.name}>{restaurant.name}</h3>
          <p className={styles.location}>
            <MapPinIcon className={styles.locationIcon} aria-hidden="true" />
            <span>{cityLabel}</span>
          </p>
          {showJobPostsCount ? (
            <p className={styles.jobCount}>
              {t("restaurants.activeJobPosts", { count: restaurant.activeJobPostsCount })}
            </p>
          ) : null}
          {hasRating ? (
            canViewProfile ? (
              <Link
                to={reviewsPath}
                className={styles.ratingLink}
                onClick={(event) => event.stopPropagation()}
                aria-label={t("restaurants.viewReviews", {
                  rating: restaurant.reviewSummary.averageRating.toFixed(1),
                })}
              >
                {ratingContent}
              </Link>
            ) : (
              <div className={styles.rating}>{ratingContent}</div>
            )
          ) : null}
        </div>
      </div>
    </>
  );

  if (canViewProfile) {
    return (
      <article
        className={`${styles.card} ${styles.cardInteractive}`}
        role="link"
        tabIndex={0}
        onClick={() => navigate(profilePath)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigate(profilePath);
          }
        }}
      >
        {cardContent}
      </article>
    );
  }

  return <article className={styles.card}>{cardContent}</article>;
};

export default RestaurantDirectoryCard;
