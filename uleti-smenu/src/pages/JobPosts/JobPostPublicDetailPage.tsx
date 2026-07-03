import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "../../store/Auth-context";
import { JobPost } from "../../models/JobPost.model";
import { GetVisibleJobPostById } from "../../services/jobPost-service";
import { ApplyToJobPost, GetMyApplications } from "../../services/application-service";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { getRestaurantProfilePath } from "../../helpers/restaurantPaths";
import { showGuestApplyRequiredToast } from "../../helpers/showGuestApplyRequiredToast";
import { toast } from "react-toastify";
import styles from "./JobPostPublicDetailPage.module.scss";

const JobPostPublicDetailPage = () => {
  const { t } = useTranslation();
  const { authStatus, role } = useContext(AuthContext);
  const { jobPostId } = useParams<{ jobPostId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = authStatus === "unauthenticated";
  const isEmployee = role === "Employee";
  const [jobPost, setJobPost] = useState<JobPost | null>(
    (location.state as { jobPost?: JobPost } | null)?.jobPost ?? null
  );
  const [isLoading, setIsLoading] = useState(!jobPost);
  const [applyInProgress, setApplyInProgress] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      if (!isEmployee || !jobPostId) {
        setHasApplied(false);
        return;
      }

      try {
        const response = await GetMyApplications();
        setHasApplied(response.data.some((application) => application.jobPostId === jobPostId));
      } catch {
        setHasApplied(false);
      }
    };

    if (authStatus !== "loading") {
      void loadApplications();
    }
  }, [authStatus, isEmployee, jobPostId]);

  useEffect(() => {
    if (!jobPostId) {
      return;
    }

    if (jobPost?.id === jobPostId) {
      setIsLoading(false);
      return;
    }

    const loadJobPost = async () => {
      setIsLoading(true);
      try {
        const response = await GetVisibleJobPostById(jobPostId);
        setJobPost(response.data);
      } catch {
        setJobPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadJobPost();
  }, [jobPost?.id, jobPostId]);

  const handleApply = async () => {
    if (!jobPost) {
      return;
    }

    if (isGuest) {
      showGuestApplyRequiredToast();
      return;
    }

    if (!isEmployee || hasApplied || applyInProgress) {
      return;
    }

    setApplyInProgress(true);
    try {
      await ApplyToJobPost(jobPost.id);
      toast.success(t("jobPosts.applySuccess"));
      setHasApplied(true);
    } catch {
      toast.error(t("jobPosts.applyError"));
    } finally {
      setApplyInProgress(false);
    }
  };

  const employer = jobPost?.employer;
  const restaurantPath =
    employer && jobPost
      ? getRestaurantProfilePath(
          { id: employer.id, publicSlug: employer.publicSlug },
          { role: role ?? undefined, myId: undefined }
        )
      : "/restaurants";

  if (isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            aria-label={t("jobPosts.backToPosts")}
            onClick={() => navigate("/oglasi-za-posao")}
          >
            <ArrowLeftIcon className={styles.backIcon} aria-hidden />
          </button>
        </header>
        <p className={styles.muted}>{t("common.loading")}</p>
      </div>
    );
  }

  if (!jobPost) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            aria-label={t("jobPosts.backToPosts")}
            onClick={() => navigate("/oglasi-za-posao")}
          >
            <ArrowLeftIcon className={styles.backIcon} aria-hidden />
          </button>
        </header>
        <p className={styles.muted}>{t("jobPosts.postNotFound")}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {isGuest && (
        <div className={styles.guestBanner}>
          <p>{t("publicBrowse.guestJobPostsBanner")}</p>
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

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          aria-label={t("jobPosts.backToPosts")}
          onClick={() => navigate("/oglasi-za-posao")}
        >
          <ArrowLeftIcon className={styles.backIcon} aria-hidden />
          <span className={styles.backLabel}>{t("nav.jobPosts")}</span>
        </button>

        <div className={styles.headerText}>
          <h1>{jobPost.title}</h1>
        </div>
      </header>

      <section className={styles.employerCard}>
        <img
          className={styles.employerLogo}
          src={getImageUrl(employer?.profilePhoto)}
          alt={employer?.name ? `${employer.name} logo` : "Employer logo"}
        />
        <div className={styles.employerInfo}>
          <Link className={styles.employerName} to={restaurantPath}>
            {employer?.name ?? "-"}
          </Link>
          {employer?.isVerifiedEmployer ? (
            <span className={styles.verifiedBadge}>{t("admin.verification.verifiedBadge")}</span>
          ) : null}
        </div>
      </section>

      <section className={styles.overview}>
        <div className={styles.overviewRow}>
          <span>{t("jobPosts.position")}</span>
          <strong>{jobPost.position}</strong>
        </div>
        <div className={styles.overviewRow}>
          <span>{t("jobPosts.location")}</span>
          <strong>
            {jobPost.restaurantLocationName
              ? `${jobPost.restaurantLocationName}${
                  jobPost.restaurantLocationCity ? ` (${jobPost.restaurantLocationCity})` : ""
                }`
              : "-"}
          </strong>
        </div>
        <div className={styles.overviewRow}>
          <span>{t("jobPosts.startingDate")}</span>
          <strong>{formatDisplayDate(String(jobPost.startingDate))}</strong>
        </div>
        <div className={styles.overviewRow}>
          <span>{t("jobPosts.salary")}</span>
          <strong>{jobPost.salary} RSD</strong>
        </div>
        <p className={styles.description}>{jobPost.description}</p>
      </section>

      {isGuest ? null : (
      <div className={styles.actions}>
        {isEmployee && hasApplied ? (
          <span className={styles.appliedBadge}>{t("jobPosts.alreadyApplied")}</span>
        ) : null}
        <button
          type="button"
          className={styles.applyButton}
          disabled={isEmployee && (hasApplied || applyInProgress)}
          onClick={() => void handleApply()}
        >
          {applyInProgress
            ? t("jobPosts.applying")
            : isEmployee && hasApplied
              ? t("jobPosts.appliedShort")
              : t("jobPosts.apply")}
        </button>
      </div>
      )}
    </div>
  );
};

export default JobPostPublicDetailPage;
