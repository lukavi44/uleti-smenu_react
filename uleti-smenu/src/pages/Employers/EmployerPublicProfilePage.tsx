import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Footer from "../../components/Footer/Footer";
import LazyLoadSentinel from "../../components/Common/LazyLoadSentinel";
import RatingBadge from "../../components/Reviews/RatingBadge";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { EmployerPublicProfile } from "../../models/EmployerPublicProfile.model";
import { GetEmployerPublicProfile } from "../../services/employer-profile-service";
import { ApplyToJobPost, GetMyApplications } from "../../services/application-service";
import { PatchClientFavorite } from "../../services/user-service";
import { AuthContext } from "../../store/Auth-context";
import { LIST_PAGE_SIZE } from "../../constants/pagination";
import { useLazyLoadList } from "../../hooks/useLazyLoadList";
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
  const [appliedJobPostIds, setAppliedJobPostIds] = useState<string[]>([]);
  const [applyInProgressForPostId, setApplyInProgressForPostId] = useState<string | null>(null);

  const appliedJobPostIdSet = useMemo(() => new Set(appliedJobPostIds), [appliedJobPostIds]);

  const activeJobPosts = profile?.activeJobPosts ?? [];
  const {
    visibleItems: visibleJobPosts,
    hasMore: hasMoreJobPosts,
    loadMore: loadMoreJobPosts,
    totalCount: jobPostsTotalCount,
    visibleCount: jobPostsVisibleCount,
  } = useLazyLoadList(activeJobPosts, LIST_PAGE_SIZE, employerId ?? "");

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

  useEffect(() => {
    const loadApplications = async () => {
      if (authStatus !== "authenticated" || role !== "Employee") {
        setAppliedJobPostIds([]);
        return;
      }

      try {
        const response = await GetMyApplications();
        setAppliedJobPostIds(response.data.map((application) => application.jobPostId));
      } catch {
        setAppliedJobPostIds([]);
      }
    };

    void loadApplications();
  }, [authStatus, role]);

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

  const handleApply = async (jobPostId: string) => {
    setApplyInProgressForPostId(jobPostId);
    try {
      await ApplyToJobPost(jobPostId);
      toast.success(t("jobPosts.applySuccess"));
      setAppliedJobPostIds((previousIds) =>
        previousIds.includes(jobPostId) ? previousIds : [...previousIds, jobPostId]
      );
    } catch {
      toast.error(t("jobPosts.applyError"));
    } finally {
      setApplyInProgressForPostId(null);
    }
  };

  const formatDate = (value: string) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }
    return parsedDate.toLocaleString();
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
              <div className={styles.headerTop}>
                <div className={styles.photoWrapper}>
                  <img
                    src={getImageUrl(profile.profilePhoto)}
                    alt={profile.name}
                    className={styles.photo}
                  />
                  <button
                    type="button"
                    className={`${styles.favouriteBtn} ${styles.favouriteBtnDesktop} ${profile.isFavourite ? styles.isFavourite : ""}`}
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
                <button
                  type="button"
                  className={`${styles.favouriteBtn} ${styles.favouriteBtnMobile} ${profile.isFavourite ? styles.isFavourite : ""}`}
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
              <div className={styles.headerContent}>
                <h1>{profile.name}</h1>
                <RatingBadge
                  averageRating={profile.reviewSummary.averageRating}
                  reviewCount={profile.reviewSummary.reviewCount}
                  subjectType="employer"
                  subjectId={employerId}
                />
                {profile.phoneNumber && <p className={styles.meta}>{profile.phoneNumber}</p>}
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
                  {visibleJobPosts.map((jobPost) => {
                    const hasApplied = appliedJobPostIdSet.has(jobPost.id);
                    return (
                      <article key={jobPost.id} className={styles.jobPostCard}>
                        <h3>{jobPost.title}</h3>
                        <p className={styles.meta}>{jobPost.position}</p>
                        <p className={styles.jobMeta}>
                          {t("employerProfile.shiftDate")}: {formatDate(jobPost.startingDate)}
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
                        <div className={styles.jobPostActions}>
                          {hasApplied && (
                            <span className={styles.appliedBadge}>{t("jobPosts.alreadyApplied")}</span>
                          )}
                          <button
                            type="button"
                            className={styles.applyButton}
                            disabled={hasApplied || applyInProgressForPostId !== null}
                            onClick={() => void handleApply(jobPost.id)}
                          >
                            {applyInProgressForPostId === jobPost.id
                              ? t("jobPosts.applying")
                              : hasApplied
                                ? t("jobPosts.appliedShort")
                                : t("jobPosts.apply")}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              <LazyLoadSentinel
                hasMore={hasMoreJobPosts}
                onLoadMore={loadMoreJobPosts}
                visibleCount={jobPostsVisibleCount}
                totalCount={jobPostsTotalCount}
              />
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
