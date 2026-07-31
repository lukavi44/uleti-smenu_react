import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AdminReportDetail } from "../../models/Admin.model";
import { getAdminReport, resolveAdminReport } from "../../services/admin-service";
import { formatDisplayDateTime } from "../../helpers/formatDisplayDateTime";
import styles from "./AdminContactMessageDetailPage.module.scss";

const AdminReportDetailPage = () => {
  const { t } = useTranslation();
  const { reportId = "" } = useParams();
  const [report, setReport] = useState<AdminReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getAdminReport(reportId);
        setReport(response.data);
        setNotes(response.data.adminNotes ?? "");
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      void load();
    }
  }, [reportId]);

  const statusLabel = (status: string) => {
    const key = `admin.reports.status.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const targetTypeLabel = (targetType: string) => {
    const key = `admin.reports.targetType.${targetType}`;
    const translated = t(key);
    return translated === key ? targetType : translated;
  };

  const handleResolve = async (event: FormEvent) => {
    event.preventDefault();
    if (!report) {
      return;
    }

    setResolving(true);
    try {
      const response = await resolveAdminReport(report.id, notes.trim() || null);
      setReport(response.data);
      setNotes(response.data.adminNotes ?? "");
      toast.success(t("admin.reports.resolveSuccess"));
    } catch {
      toast.error(t("admin.reports.resolveError"));
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return <p className={styles.emptyState}>{t("common.loading")}</p>;
  }

  if (!report) {
    return (
      <div className={styles.page}>
        <Link to="/admin/reports" className={styles.backLink}>
          ← {t("admin.reports.backToList")}
        </Link>
        <p className={styles.emptyState}>{t("admin.reports.notFound")}</p>
      </div>
    );
  }

  const targetHref =
    report.targetType === "JobPost"
      ? `/admin/job-posts`
      : report.targetType === "Employer"
        ? `/admin/employers/${report.targetId}`
        : undefined;

  return (
    <div className={styles.page}>
      <Link to="/admin/reports" className={styles.backLink}>
        ← {t("admin.reports.backToList")}
      </Link>

      <section className={styles.headerCard}>
        <div>
          <h2 className={styles.headerTitle}>{report.targetLabel}</h2>
          <p className={styles.headerMeta}>
            {targetTypeLabel(report.targetType)} · {report.reason}
          </p>
          <p className={styles.headerMeta}>
            {t("admin.reports.reporter")}: {report.reporterEmail}
          </p>
          <p className={styles.headerMeta}>{formatDisplayDateTime(report.createdAtUtc)}</p>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${report.status === "Open" ? styles.badgeOpen : ""}`}>
              {statusLabel(report.status)}
            </span>
          </div>
        </div>
        {targetHref ? (
          <Link className={styles.secondaryAction} to={targetHref}>
            {t("admin.reports.openTarget")}
          </Link>
        ) : null}
      </section>

      {report.details ? (
        <section className={styles.panel}>
          <h3>{t("admin.reports.details")}</h3>
          <p className={styles.body}>{report.details}</p>
        </section>
      ) : null}

      {report.status === "Open" ? (
        <form className={styles.panel} onSubmit={(event) => void handleResolve(event)}>
          <label className={styles.label} htmlFor="report-notes">
            {t("admin.reports.notes")}
          </label>
          <textarea
            id="report-notes"
            className={styles.textarea}
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={t("admin.reports.notesPlaceholder")}
          />
          <button type="submit" className={styles.primaryAction} disabled={resolving}>
            {resolving ? t("common.loading") : t("admin.reports.resolve")}
          </button>
        </form>
      ) : (
        <section className={styles.panel}>
          <p className={styles.headerMeta}>
            {statusLabel(report.status)}
            {report.resolvedAtUtc ? ` · ${formatDisplayDateTime(report.resolvedAtUtc)}` : ""}
          </p>
          {report.adminNotes ? <p className={styles.body}>{report.adminNotes}</p> : null}
        </section>
      )}
    </div>
  );
};

export default AdminReportDetailPage;
