import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer/Footer";
import RatingBadge from "../../components/Reviews/RatingBadge";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { EmployerPublicProfile } from "../../models/EmployerPublicProfile.model";
import { GetEmployerPublicProfile } from "../../services/employer-profile-service";
import { PatchClientFavorite } from "../../services/user-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./EmployerPublicProfilePage.module.scss";

const formatAddress = (location: EmployerPublicProfile["locations"][number]) => {
  const street = [location.streetName, location.streetNumber].filter(Boolean).join(" ");
  const cityLine = [location.postalCode, location.city].filter(Boolean).join(" ");
  return [street, cityLine, location.country].filter(Boolean).join(", ");
};

const EmployerPublicProfilePage = () => {
  const { t } = useTranslation();
  const { employerId } = useParams();
  const { authStatus, role } = useContext(AuthContext);
  const [profile, setProfile] = useState<EmployerPublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [favouriteInProgress, setFavouriteInProgress] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!employerId) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await GetEmployerPublicProfile(employerId);
        setProfile(response.data);
        setLoadError(false);
      } catch {
        setProfile(null);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (authStatus === "authenticated" && role === "Employee") {
      void loadProfile();
    }
  }, [authStatus, role, employerId]);

  const handleToggleFavourite = async () => {
    if (!employerId || !profile || favouriteInProgress) return;

    setFavouriteInProgress(true);
    try {
      await PatchClientFavorite(employerId);
      setProfile((current) =>
        current ? { ...current, isFavourite: !current.isFavourite } : current
      );
    } catch {
      // keep current state on failure
    } finally {
      setFavouriteInProgress(false);
    }
  };

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated" || role !== "Employee") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  return (
    <>
      <main className={styles.page}>
        <Link className={styles.backLink} to="/restaurants">
          {t("employerProfile.backToRestaurants")}
        </Link>

        {isLoading && <p className={styles.mutedText}>{t("common.loading")}</p>}
        {loadError && !isLoading && <p className={styles.mutedText}>{t("employerProfile.loadError")}</p>}

        {!isLoading && !loadError && profile && (
          <>
            <header className={styles.header}>
              <img
                src={getImageUrl(profile.profilePhoto)}
                alt={profile.name}
                className={styles.photo}
              />
              <div className={styles.headerContent}>
                <h1>{profile.name}</h1>
                <RatingBadge
                  averageRating={profile.reviewSummary.averageRating}
                  reviewCount={profile.reviewSummary.reviewCount}
                  subjectType="employer"
                  subjectId={employerId}
                />
                {profile.phoneNumber && <p className={styles.meta}>{profile.phoneNumber}</p>}
                <button
                  type="button"
                  className={`${styles.favouriteBtn} ${profile.isFavourite ? styles.isFavourite : ""}`}
                  aria-label={
                    profile.isFavourite
                      ? t("employers.removeFromFavorites")
                      : t("employers.addToFavorites")
                  }
                  disabled={favouriteInProgress}
                  onClick={() => void handleToggleFavourite()}
                >
                  {profile.isFavourite ? "★" : "☆"}
                </button>
              </div>
            </header>

            <section className={styles.section}>
              <h2>{t("employerProfile.locations")}</h2>
              {profile.locations.length === 0 ? (
                <p className={styles.mutedText}>{t("employerProfile.noLocations")}</p>
              ) : (
                <div className={styles.locationList}>
                  {profile.locations.map((location) => (
                    <article key={location.id} className={styles.locationCard}>
                      <h3>{location.name}</h3>
                      {location.phoneNumber && <p className={styles.meta}>{location.phoneNumber}</p>}
                      <p className={styles.jobMeta}>{formatAddress(location)}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.section}>
              <h2>{t("employerProfile.activeJobPosts")}</h2>
              {profile.activeJobPosts.length === 0 ? (
                <p className={styles.mutedText}>{t("employerProfile.noActiveJobPosts")}</p>
              ) : (
                <div className={styles.jobPostList}>
                  {profile.activeJobPosts.map((jobPost) => (
                    <article key={jobPost.id} className={styles.jobPostCard}>
                      <h3>{jobPost.title}</h3>
                      <p className={styles.meta}>{jobPost.position}</p>
                      <p className={styles.jobMeta}>
                        {t("employerProfile.shiftDate")}:{" "}
                        {new Date(jobPost.startingDate).toLocaleDateString()}
                      </p>
                      <p className={styles.jobMeta}>
                        {t("employerProfile.salary")}: {jobPost.salary} RSD
                      </p>
                      {(jobPost.restaurantLocationName || jobPost.restaurantLocationCity) && (
                        <p className={styles.jobMeta}>
                          {t("employerProfile.location")}:{" "}
                          {[jobPost.restaurantLocationName, jobPost.restaurantLocationCity]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
              <Link className={styles.jobPostLink} to="/oglasi-za-posao">
                {t("employerProfile.browseAllJobPosts")}
              </Link>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default EmployerPublicProfilePage;
