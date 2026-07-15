import { useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import RestaurantDetailHeader from "../../components/Restaurants/RestaurantDetailHeader";
import { EmployerDirectoryPreview } from "../../models/EmployerDirectoryPreview.model";
import { EmployerPublicProfile } from "../../models/EmployerPublicProfile.model";
import {
  GetEmployerDirectoryPreviewBySlug,
  GetEmployerPublicPreviewBySlug,
  GetEmployerPublicProfileBySlug,
} from "../../services/employer-profile-service";
import { ApplyToJobPost, GetMyApplications } from "../../services/application-service";
import { PatchClientFavorite } from "../../services/user-service";
import { AuthContext } from "../../store/Auth-context";
import EmployerPublicProfileSections from "./EmployerPublicProfileSections";
import styles from "./EmployerPublicProfilePage.module.scss";

const getProfileCity = (profile: EmployerPublicProfile) => {
  if (profile.city?.trim()) {
    return profile.city.trim();
  }

  const cities = profile.locations
    .map((location) => location.city?.trim())
    .filter((city): city is string => Boolean(city));
  return [...new Set(cities)].join(", ") || undefined;
};

const EmployerPublicProfilePage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { authStatus, role, me } = useContext(AuthContext);
  const isEmployeeView = role === "Employee";
  const isEmployerPreview = role === "Employer";
  const isGuestView = authStatus === "unauthenticated";
  const canAccessPage = isEmployeeView || isEmployerPreview || isGuestView;
  const myEmployerSlug =
    me && "publicSlug" in me ? String(me.publicSlug ?? "").trim().toLowerCase() : "";

  const [profile, setProfile] = useState<EmployerPublicProfile | null>(null);
  const [preview, setPreview] = useState<EmployerDirectoryPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [favouriteInProgress, setFavouriteInProgress] = useState(false);
  const [appliedJobPostIds, setAppliedJobPostIds] = useState<string[]>([]);
  const [applyInProgressForPostId, setApplyInProgressForPostId] = useState<string | null>(null);

  const isOwnRestaurant =
    isEmployerPreview &&
    me &&
    "id" in me &&
    ((slug != null &&
      myEmployerSlug.length > 0 &&
      slug.trim().toLowerCase() === myEmployerSlug) ||
      (profile?.employerId != null &&
        String(me.id).toLowerCase() === String(profile.employerId).toLowerCase()) ||
      (preview?.employerId != null &&
        String(me.id).toLowerCase() === String(preview.employerId).toLowerCase()));

  const appliedJobPostIdSet = useMemo(() => new Set(appliedJobPostIds), [appliedJobPostIds]);
  const reviewsHref = slug ? `/restaurants/${slug}/reviews` : undefined;

  useEffect(() => {
    const loadProfile = async () => {
      if (!slug || !canAccessPage || isOwnRestaurant) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(false);

      try {
        if (isEmployeeView) {
          const response = await GetEmployerPublicProfileBySlug(slug);
          setProfile(response.data);
          setPreview(null);
        } else if (isEmployerPreview) {
          const response = await GetEmployerDirectoryPreviewBySlug(slug);
          setPreview(response.data);
          setProfile(null);
        } else {
          const response = await GetEmployerPublicPreviewBySlug(slug);
          setPreview(response.data);
          setProfile(null);
        }
      } catch {
        setProfile(null);
        setPreview(null);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (authStatus !== "loading") {
      void loadProfile();
    }
  }, [authStatus, canAccessPage, isEmployeeView, isEmployerPreview, isOwnRestaurant, slug]);

  useEffect(() => {
    const loadApplications = async () => {
      if (!isEmployeeView) {
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
  }, [isEmployeeView]);

  const handleToggleFavourite = async () => {
    if (!profile?.employerId || favouriteInProgress) return;

    setFavouriteInProgress(true);
    try {
      await PatchClientFavorite(profile.employerId);
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

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "authenticated" && !canAccessPage) {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  if (isOwnRestaurant) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} to="/restaurants">
        {t("employerProfile.backToRestaurants")}
      </Link>

      {isLoading && <p className={styles.mutedText}>{t("common.loading")}</p>}
      {loadError && !isLoading && <p className={styles.mutedText}>{t("employerProfile.loadError")}</p>}

      {!isLoading && !loadError && preview && (
        <div className={styles.previewStack}>
          {isGuestView && (
            <div className={styles.guestBanner}>
              <p>{t("publicBrowse.guestProfileBanner")}</p>
              <div className={styles.guestBannerActions}>
                <Link className={styles.guestBannerPrimary} to="/login">
                  {t("publicBrowse.signIn")}
                </Link>
                <Link className={styles.guestBannerSecondary} to="/registration/candidate">
                  {t("publicBrowse.register")}
                </Link>
              </div>
            </div>
          )}

          <RestaurantDetailHeader
            name={preview.name}
            profilePhoto={preview.profilePhoto}
            city={preview.city || undefined}
            reviewSummary={preview.reviewSummary}
            activeJobPostsCount={preview.activeJobPostsCount}
            locationsCount={0}
            reviewsHref={reviewsHref}
          />

          {preview.activeJobPostsCount > 0 && (
            <Link className={styles.previewActionLink} to="/oglasi-za-posao">
              {t("employerProfile.browseAllJobPosts")}
            </Link>
          )}
        </div>
      )}

      {!isLoading && !loadError && profile && slug && (
        <>
          <RestaurantDetailHeader
            name={profile.name}
            profilePhoto={profile.profilePhoto}
            city={getProfileCity(profile)}
            isVerified={profile.isVerifiedEmployer}
            reviewSummary={profile.reviewSummary}
            activeJobPostsCount={profile.activeJobPosts.length}
            locationsCount={profile.locations.length}
            successfulHiresCount={profile.successfulHiresCount}
            reviewsHref={reviewsHref}
            isFavourite={profile.isFavourite}
            favouriteInProgress={favouriteInProgress}
            onToggleFavourite={() => void handleToggleFavourite()}
          />
          <EmployerPublicProfileSections
            slug={slug}
            profile={profile}
            appliedJobPostIdSet={appliedJobPostIdSet}
            applyInProgressForPostId={applyInProgressForPostId}
            onApply={(jobPostId) => void handleApply(jobPostId)}
          />
        </>
      )}
    </main>
  );
};

export default EmployerPublicProfilePage;
