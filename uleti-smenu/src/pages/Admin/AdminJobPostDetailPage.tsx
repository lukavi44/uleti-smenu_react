import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AdminJobPostDetail } from "../../models/Admin.model";
import { archiveAdminJobPost, getAdminJobPostDetail } from "../../services/admin-service";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { formatDisplayDateTime } from "../../helpers/formatDisplayDateTime";
import styles from "./AdminJobPostDetailPage.module.scss";

type DetailTab = "overview" | "applications";

const AdminJobPostDetailPage = () => {
  const { t } = useTranslation();
  const { jobPostId = "" } = useParams();
  const [jobPost, setJobPost] = useState<AdminJobPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getAdminJobPostDetail(jobPostId);
        setJobPost(response.data);
      } catch {
        setJobPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (jobPostId) {
      void load();
    }
  }, [jobPostId]);

  const statusLabel = (status: string, kind: "job" | "application") => {
    const key = kind === "job" ? `admin.jobStatus.${status}` : `admin.applicationStatus.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const handleArchive = async () => {
    if (!jobPost || !window.confirm(t("admin.jobPostDetail.archiveConfirm"))) {
      return;
    }

    setArchiving(true);
    try {
      const response = await archiveAdminJobPost(jobPost.id);
      setJobPost(response.data);
      toast.success(t("admin.jobPostDetail.archiveSuccess"));
    } catch {
      toast.error(t("admin.jobPostDetail.archiveError"));
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return <p className={styles.emptyState}>{t("common.loading")}</p>;
  }

  if (!jobPost) {
    return (
      <div className={styles.page}>
        <Link to="/admin/job-posts" className={styles.backLink}>
          ← {t("admin.jobPostDetail.backToList")}
        </Link>
        <p className={styles.emptyState}>{t("admin.jobPostDetail.notFound")}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/admin/job-posts" className={styles.backLink}>
        ← {t("admin.jobPostDetail.backToList")}
      </Link>

      <section className={styles.headerCard}>
        <div>
          <h2 className={styles.headerTitle}>{jobPost.title}</h2>
          <p className={styles.headerMeta}>
            <Link className={styles.linkButton} to={`/admin/employers/${jobPost.employerId}`}>
              {jobPost.employerName}
            </Link>
            {jobPost.locationName ? ` · ${jobPost.locationName}` : ""}
          </p>
          <p className={styles.headerStatus}>
            <span className={`${styles.badge} ${jobPost.status === "Active" ? styles.badgeActive : ""}`}>
              {statusLabel(jobPost.status, "job")}
            </span>
          </p>
        </div>
        {jobPost.canArchive ? (
          <button
            type="button"
            className={styles.dangerAction}
            disabled={archiving}
            onClick={() => void handleArchive()}
          >
            {archiving ? t("common.loading") : t("admin.jobPostDetail.archive")}
          </button>
        ) : null}
      </section>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "overview" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          {t("admin.jobPostDetail.overview")}
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "applications" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          {t("admin.jobPostDetail.applications")} ({jobPost.applicationsCount})
        </button>
      </div>

      {activeTab === "overview" ? (
        <section className={styles.panel}>
          <dl className={styles.detailsGrid}>
            <div>
              <dt>{t("admin.jobPostDetail.position")}</dt>
              <dd>{jobPost.position || "—"}</dd>
            </div>
            <div>
              <dt>{t("admin.jobPostDetail.salary")}</dt>
              <dd>{jobPost.salary.toLocaleString()} RSD</dd>
            </div>
            <div>
              <dt>{t("admin.jobPostDetail.location")}</dt>
              <dd>{jobPost.locationName ?? "—"}</dd>
            </div>
            <div>
              <dt>{t("admin.jobPostDetail.startingDate")}</dt>
              <dd>{formatDisplayDateTime(jobPost.startingDate) || "—"}</dd>
            </div>
            <div>
              <dt>{t("admin.jobPostDetail.visibleUntil")}</dt>
              <dd>{formatDisplayDateTime(jobPost.visibleUntil) || "—"}</dd>
            </div>
            <div>
              <dt>{t("admin.jobPostDetail.created")}</dt>
              <dd>{formatDisplayDate(jobPost.createdAtUtc) || "—"}</dd>
            </div>
          </dl>
          <div className={styles.descriptionBlock}>
            <h3>{t("admin.jobPostDetail.description")}</h3>
            <p>{jobPost.description || "—"}</p>
          </div>
        </section>
      ) : (
        <section className={styles.panel}>
          {jobPost.applications.length === 0 ? (
            <p className={styles.emptyState}>{t("admin.jobPostDetail.noApplications")}</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t("admin.applications.columns.candidate")}</th>
                    <th>{t("admin.employers.columns.status")}</th>
                    <th>{t("admin.applications.columns.applied")}</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPost.applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.candidateName}</td>
                      <td>
                        <span className={styles.badge}>{statusLabel(application.status, "application")}</span>
                      </td>
                      <td>{formatDisplayDate(application.appliedAtUtc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminJobPostDetailPage;
