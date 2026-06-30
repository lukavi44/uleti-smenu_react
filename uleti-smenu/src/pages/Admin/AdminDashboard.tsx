import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminDashboard as AdminDashboardData, AdminRecentActivityType } from "../../models/Admin.model";
import { getAdminDashboard } from "../../services/admin-service";
import styles from "./AdminDashboard.module.scss";

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const formatRelativeTime = (value: string, locale: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return locale.startsWith("sr") ? "upravo sada" : "just now";
  }
  if (minutes < 60) {
    return locale.startsWith("sr") ? `pre ${minutes} min` : `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale.startsWith("sr") ? `pre ${hours} h` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return locale.startsWith("sr") ? `pre ${days} d` : `${days}d ago`;
};

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => formatDateInput(new Date(Date.now() - 6 * 86400000)));
  const [toDate, setToDate] = useState(() => formatDateInput(new Date()));

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await getAdminDashboard(
          new Date(`${fromDate}T00:00:00.000Z`).toISOString(),
          new Date(`${toDate}T23:59:59.999Z`).toISOString()
        );
        setDashboard(response.data);
      } catch {
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [fromDate, toDate]);

  const chartMax = useMemo(() => {
    if (!dashboard?.applicationsChart.length) {
      return 1;
    }
    return Math.max(...dashboard.applicationsChart.map((point) => point.count), 1);
  }, [dashboard]);

  const activityLabel = (type: AdminRecentActivityType) => {
    const keyMap: Record<AdminRecentActivityType, string> = {
      EmployerRegistered: "admin.activity.employerRegistered",
      JobPostCreated: "admin.activity.jobPostCreated",
      CandidateAccepted: "admin.activity.candidateAccepted",
      WalletTopUp: "admin.activity.walletTopUp",
      ReportSubmitted: "admin.activity.reportSubmitted",
    };
    return t(keyMap[type]);
  };

  const formatRelative = (value: string) => formatRelativeTime(value, i18n.language);

  const summaryCards = dashboard
    ? [
        { label: t("admin.dashboard.totalCandidates"), value: dashboard.totalCandidates.toLocaleString() },
        { label: t("admin.dashboard.totalEmployers"), value: dashboard.totalEmployers.toLocaleString() },
        { label: t("admin.dashboard.activeJobPosts"), value: dashboard.activeJobPosts.toLocaleString() },
        { label: t("admin.dashboard.reports"), value: dashboard.reportsCount.toLocaleString() },
        {
          label: t("admin.dashboard.walletTopUpsMonth"),
          value: `${dashboard.walletTopUpsThisMonth.toLocaleString()} RSD`,
        },
        {
          label: t("admin.dashboard.acceptedAllTime"),
          value: dashboard.acceptedCandidatesAllTime.toLocaleString(),
        },
      ]
    : [];

  return (
    <div className={styles.dashboard}>
      <div className={styles.toolbar}>
        <div className={styles.dateRange}>
          <input
            type="date"
            className={styles.dateInput}
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            aria-label={t("admin.dashboard.dateFrom")}
          />
          <span>–</span>
          <input
            type="date"
            className={styles.dateInput}
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            aria-label={t("admin.dashboard.dateTo")}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.summaryGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.skeleton} />
          ))}
        </div>
      ) : (
        <>
          <div className={styles.summaryGrid}>
            {summaryCards.map((card) => (
              <article key={card.label} className={styles.summaryCard}>
                <p className={styles.summaryLabel}>{card.label}</p>
                <p className={styles.summaryValue}>{card.value}</p>
              </article>
            ))}
          </div>

          <div className={styles.allTimeGrid}>
            <article className={styles.summaryCard}>
              <p className={styles.summaryLabel}>{t("admin.dashboard.acceptedAllTimeStat")}</p>
              <p className={styles.summaryValue}>{dashboard?.acceptedCandidatesAllTime.toLocaleString() ?? "0"}</p>
            </article>
            <article className={styles.summaryCard}>
              <p className={styles.summaryLabel}>{t("admin.dashboard.completedShiftsAllTime")}</p>
              <p className={styles.summaryValue}>{dashboard?.completedShiftsAllTime.toLocaleString() ?? "0"}</p>
            </article>
          </div>

          <div className={styles.contentGrid}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>{t("admin.dashboard.applicationsChart")}</h2>
              <div className={styles.chart}>
                {dashboard?.applicationsChart.map((point) => (
                  <div key={point.date} className={styles.chartBarWrap}>
                    <div
                      className={styles.chartBar}
                      style={{ height: `${Math.max(8, (point.count / chartMax) * 140)}px` }}
                      title={`${point.count}`}
                    />
                    <span className={styles.chartLabel}>{point.date.slice(5).replace("-", ".")}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>{t("admin.dashboard.recentActivity")}</h2>
              <div className={styles.activityList}>
                {dashboard?.recentActivities.length ? (
                  dashboard.recentActivities.map((activity) => (
                    <article key={`${activity.type}-${activity.relatedEntityId}-${activity.occurredAtUtc}`} className={styles.activityItem}>
                      <span className={styles.activityDot} aria-hidden="true" />
                      <div>
                        <p className={styles.activityTitle}>{activityLabel(activity.type)}</p>
                        <p className={styles.activityMeta}>
                          {activity.title}
                          {activity.subtitle ? ` · ${activity.subtitle}` : ""} · {formatRelative(activity.occurredAtUtc)}
                        </p>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className={styles.emptyState}>{t("admin.dashboard.noActivity")}</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
