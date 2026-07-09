import { useContext, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../store/Auth-context";
import { JobPost } from "../../models/JobPost.model";
import { GetMyJobPosts } from "../../services/jobPost-service";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { getEmployerJobPostStatusBadge } from "../../helpers/employerJobPostMobile";
import EmployerJobPostCandidatesList from "../../components/JobPosts/EmployerJobPostCandidatesList";
import JobPostManagePanel from "../../components/JobPosts/JobPostManagePanel";
import { useJobPostManageHandlers } from "../../hooks/useJobPostManageHandlers";
import styles from "./EmployerJobPostDetailPage.module.scss";

type DetailTab = "overview" | "candidates";

const EmployerJobPostDetailPage = () => {
  const { t } = useTranslation();
  const { authStatus, role } = useContext(AuthContext);
  const { jobPostId } = useParams<{ jobPostId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:1023px)");
  const [jobPost, setJobPost] = useState<JobPost | null>(
    (location.state as { jobPost?: JobPost } | null)?.jobPost ?? null
  );
  const [activeTab, setActiveTab] = useState<DetailTab>(
    (location.state as { previewMode?: boolean } | null)?.previewMode ? "overview" : "candidates"
  );
  const [isLoading, setIsLoading] = useState(!jobPost);
  const [manageJobPost, setManageJobPost] = useState<JobPost | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reloadJobPost = () => setReloadToken((token) => token + 1);

  const manageHandlers = useJobPostManageHandlers({
    onPostsChanged: () => {
      reloadJobPost();
      navigate("/oglasi-za-posao");
    },
    onEdit: (post) => navigate("/oglasi-za-posao", { state: { openEditForm: true, jobPost: post } }),
    onViewCandidates: (post) => {
      setJobPost(post);
      setActiveTab("candidates");
    },
    onPreview: () => setActiveTab("overview"),
  });

  useEffect(() => {
    if (!jobPostId || authStatus !== "authenticated" || role !== "Employer") {
      return;
    }

    const loadJobPost = async () => {
      setIsLoading(true);
      try {
        const response = await GetMyJobPosts();
        const match = response.data.find((post) => post.id === jobPostId) ?? null;
        setJobPost(match);
      } finally {
        setIsLoading(false);
      }
    };

    void loadJobPost();
  }, [authStatus, jobPostId, reloadToken, role]);

  const applicantCount = jobPost?.applicantCount ?? 0;
  const statusBadge = useMemo(
    () => (jobPost ? getEmployerJobPostStatusBadge(jobPost, t) : null),
    [jobPost, t]
  );

  if (!isMobile) {
    return <Navigate to="/oglasi-za-posao" replace />;
  }

  if (authStatus === "loading" || isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <button
              type="button"
              className={styles.backButton}
              aria-label={t("jobPosts.backToPosts")}
              onClick={() => navigate("/oglasi-za-posao")}
            >
              <ArrowLeftIcon className={styles.backIcon} aria-hidden />
            </button>
          </div>
        </header>
        <p className={styles.muted}>{t("common.loading")}</p>
      </div>
    );
  }

  if (authStatus === "unauthenticated" || role !== "Employer") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  if (!jobPost) {
    return (
      <div className={styles.page}>
        <button type="button" className={styles.backButton} onClick={() => navigate("/oglasi-za-posao")}>
          <ArrowLeftIcon className={styles.backIcon} aria-hidden />
        </button>
        <p className={styles.muted}>{t("jobPosts.postNotFound")}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button
            type="button"
            className={styles.backButton}
            aria-label={t("jobPosts.backToPosts")}
            onClick={() => navigate("/oglasi-za-posao")}
          >
            <ArrowLeftIcon className={styles.backIcon} aria-hidden />
            <span className={styles.backLabel}>{t("nav.jobPosts")}</span>
          </button>

          <button
            type="button"
            className={styles.menuButton}
            aria-label={t("header.menu")}
            onClick={() => setManageJobPost(jobPost)}
          >
            <EllipsisVerticalIcon className={styles.menuIcon} aria-hidden />
          </button>
        </div>

        <div className={styles.headerText}>
          <h1>{jobPost.title}</h1>
          {statusBadge && (
            <div className={styles.statusRow}>
              <span className={`${styles.statusBadge} ${styles[`statusBadge${statusBadge.variant}`]}`}>
                {statusBadge.label}
              </span>
              <span className={styles.publishedAt}>
                {t("jobPosts.publishedOn", {
                  date: formatDisplayDate(String(jobPost.startingDate)),
                })}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "overview" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          {t("jobPosts.tabOverview")}
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "candidates" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("candidates")}
        >
          {t("jobPosts.tabCandidates", { count: applicantCount })}
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "overview" ? (
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
        ) : (
          <EmployerJobPostCandidatesList jobPostId={jobPost.id} />
        )}
      </div>

      <JobPostManagePanel
        jobPost={manageJobPost}
        isOpen={Boolean(manageJobPost)}
        onClose={() => setManageJobPost(null)}
        {...manageHandlers}
      />
    </div>
  );
};

export default EmployerJobPostDetailPage;
