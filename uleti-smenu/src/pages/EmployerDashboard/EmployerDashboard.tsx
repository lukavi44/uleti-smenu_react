import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import { JobPost } from "../../models/JobPost.model";
import { EmployerDashboardSummary } from "../../models/EmployerDashboardSummary.model";
import {
  GetEmployerDashboardSummary,
  GetMyJobPosts,
  GetMyJobPostsPaged,
} from "../../services/jobPost-service";
import { GetMyUnreadChatCount } from "../../services/chat-service";
import { subscribeChatUnreadCount, startRealtimeConnection } from "../../services/realtime-service";
import {
  buildEmployerDashboardSummaryFromPosts,
  normalizeEmployerDashboardSummary,
} from "../../helpers/employerDashboard";
import {
  PendingApplicantItem,
  loadPendingApplicantsForDashboard,
} from "../../helpers/employerDashboardPending";
import EmployerDashboardSummaryCards from "../../components/EmployerDashboard/EmployerDashboardSummaryCards";
import EmployerDashboardPendingCarousel from "../../components/EmployerDashboard/EmployerDashboardPendingCarousel";
import EmployerDashboardJobPostsList from "../../components/EmployerDashboard/EmployerDashboardJobPostsList";
import EmployerDashboardMobileGreeting from "../../components/EmployerDashboard/EmployerDashboardMobileGreeting";
import styles from "./EmployerDashboard.module.scss";

const EmployerDashboard = () => {
  const { t } = useTranslation();
  const { authStatus, role } = useContext(AuthContext);
  const [dashboardSummary, setDashboardSummary] = useState<EmployerDashboardSummary | null>(null);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [pendingApplicants, setPendingApplicants] = useState<PendingApplicantItem[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isJobPostsLoading, setIsJobPostsLoading] = useState(true);
  const [isPendingLoading, setIsPendingLoading] = useState(true);

  const isEmployer = authStatus === "authenticated" && role === "Employer";

  useEffect(() => {
    if (!isEmployer) {
      return;
    }

    void startRealtimeConnection();

    const loadUnread = async () => {
      try {
        const response = await GetMyUnreadChatCount();
        setUnreadMessagesCount(response.data.count);
      } catch {
        setUnreadMessagesCount(0);
      }
    };

    void loadUnread();
    const unsubscribe = subscribeChatUnreadCount((count) => setUnreadMessagesCount(count));
    return () => {
      unsubscribe();
    };
  }, [isEmployer]);

  useEffect(() => {
    const loadEmployerDashboardOverview = async () => {
      if (!isEmployer) {
        return;
      }

      setIsOverviewLoading(true);

      try {
        try {
          const summaryResponse = await GetEmployerDashboardSummary();
          setDashboardSummary(
            normalizeEmployerDashboardSummary(
              summaryResponse.data as unknown as Record<string, unknown>
            )
          );
        } catch {
          const [activePostsResponse, allPostsResponse] = await Promise.all([
            GetMyJobPostsPaged({ page: 1, pageSize: 1, lifecycle: "active" }),
            GetMyJobPosts(),
          ]);

          setDashboardSummary(
            buildEmployerDashboardSummaryFromPosts(
              allPostsResponse.data,
              activePostsResponse.data.totalCount
            )
          );
        }
      } catch (error) {
        console.error("Failed to load employer dashboard overview.", error);
      } finally {
        setIsOverviewLoading(false);
      }
    };

    void loadEmployerDashboardOverview();
  }, [isEmployer]);

  useEffect(() => {
    const loadJobPosts = async () => {
      if (!isEmployer) return;

      setIsJobPostsLoading(true);

      try {
        const response = await GetMyJobPosts();
        setJobPosts(response.data);
      } catch (error) {
        console.error("Failed to load employer job posts.", error);
      } finally {
        setIsJobPostsLoading(false);
      }
    };

    void loadJobPosts();
  }, [isEmployer]);

  useEffect(() => {
    const loadPendingApplicants = async () => {
      if (!isEmployer) return;

      setIsPendingLoading(true);

      try {
        const applicants = await loadPendingApplicantsForDashboard();
        setPendingApplicants(applicants);
      } catch (error) {
        console.error("Failed to load pending applicants.", error);
        setPendingApplicants([]);
      } finally {
        setIsPendingLoading(false);
      }
    };

    void loadPendingApplicants();
  }, [isEmployer]);

  const handleApplicantUpdated = (applicationId: string) => {
    setPendingApplicants((previous) =>
      previous.filter((applicant) => applicant.applicationId !== applicationId)
    );
    setDashboardSummary((previous) =>
      previous
        ? {
            ...previous,
            pendingApplicantsCount: Math.max(0, previous.pendingApplicantsCount - 1),
          }
        : previous
    );
  };

  const pendingCount = useMemo(() => pendingApplicants.length, [pendingApplicants]);

  const displayedPendingCount = !isPendingLoading
    ? pendingCount
    : (dashboardSummary?.pendingApplicantsCount ?? 0);

  if (!isEmployer) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <EmployerDashboardMobileGreeting />

      <section className={styles.section}>
        {isOverviewLoading ? (
          <div className={styles.summarySkeleton} aria-hidden />
        ) : (
          <EmployerDashboardSummaryCards
            activeJobPostsCount={dashboardSummary?.activeJobPostsCount ?? 0}
            pendingApplicantsCount={displayedPendingCount}
            unreadMessagesCount={unreadMessagesCount}
          />
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>{t("home.applicantsWaiting")}</h2>
            {pendingCount > 0 ? (
              <span className={styles.countBadge}>{pendingCount}</span>
            ) : null}
          </div>
          <Link className={styles.sectionLink} to="/oglasi-za-posao">
            {t("home.dashboard.viewAllCandidates")} →
          </Link>
        </div>
        <EmployerDashboardPendingCarousel
          applicants={pendingApplicants}
          isLoading={isPendingLoading}
          onApplicantUpdated={handleApplicantUpdated}
        />
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.myJobPosts")}</h2>
          <Link className={`${styles.sectionLink} ${styles.sectionLinkDesktop}`} to="/oglasi-za-posao">
            {t("home.viewAllPosts")} →
          </Link>
        </div>
        <EmployerDashboardJobPostsList jobPosts={jobPosts} isLoading={isJobPostsLoading} />
      </section>
    </div>
  );
};

export default EmployerDashboard;
