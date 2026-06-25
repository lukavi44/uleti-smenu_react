import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import { JobPost } from "../../models/JobPost.model";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import { EmployerDashboardSummary } from "../../models/EmployerDashboardSummary.model";
import {
  GetEmployerDashboardSummary,
  GetMyJobPosts,
  GetMyJobPostsPaged,
} from "../../services/jobPost-service";
import { GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { GetApplicantsForJobPost } from "../../services/application-service";
import EmployerApplicantsPanel from "../../components/JobPosts/EmployerApplicantsPanel";
import {
  buildApplicantCountsFromPosts,
  buildEmployerDashboardSummaryFromPosts,
  normalizeEmployerDashboardSummary,
} from "../../helpers/employerDashboard";
import { getJobPostDisplayStatusLabel } from "../../helpers/jobPostStatus";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { LIST_PAGE_SIZE } from "../../constants/pagination";
import styles from "./EmployerDashboard.module.scss";

const EmployerDashboard = () => {
  const { t } = useTranslation();
  const { authStatus, role } = useContext(AuthContext);
  const [dashboardSummary, setDashboardSummary] = useState<EmployerDashboardSummary | null>(null);
  const [myLocations, setMyLocations] = useState<RestaurantLocation[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [jobPostsPage, setJobPostsPage] = useState(1);
  const [jobPostsTotalCount, setJobPostsTotalCount] = useState(0);
  const [applicantsWaitingPosts, setApplicantsWaitingPosts] = useState<JobPost[]>([]);
  const [applicantsWaitingPage, setApplicantsWaitingPage] = useState(1);
  const [applicantsWaitingTotalCount, setApplicantsWaitingTotalCount] = useState(0);

  const isEmployer = authStatus === "authenticated" && role === "Employer";

  useEffect(() => {
    const loadEmployerDashboardOverview = async () => {
      if (!isEmployer) {
        return;
      }

      try {
        const locationsResponse = await GetMyRestaurantLocations();
        setMyLocations(locationsResponse.data);

        try {
          const summaryResponse = await GetEmployerDashboardSummary();
          setDashboardSummary(
            normalizeEmployerDashboardSummary(
              summaryResponse.data as unknown as Record<string, unknown>
            )
          );
          return;
        } catch {
          // Fall back to existing endpoints when dashboard-summary is unavailable.
        }

        const [activePostsResponse, allPostsResponse] = await Promise.all([
          GetMyJobPostsPaged({ page: 1, pageSize: 1, lifecycle: "active" }),
          GetMyJobPosts(),
        ]);

        const posts = allPostsResponse.data;
        const hasApplicantCounts = posts.some((post) => typeof post.applicantCount === "number");

        let applicantCountsByPostId: Record<string, number>;
        if (hasApplicantCounts) {
          applicantCountsByPostId = buildApplicantCountsFromPosts(posts);
        } else {
          const countEntries = await Promise.all(
            posts.map(async (post) => {
              try {
                const applicantsResponse = await GetApplicantsForJobPost(post.id);
                return [post.id, applicantsResponse.data.length] as const;
              } catch {
                return [post.id, 0] as const;
              }
            })
          );
          applicantCountsByPostId = Object.fromEntries(countEntries);
        }

        setDashboardSummary(
          buildEmployerDashboardSummaryFromPosts(
            posts,
            activePostsResponse.data.totalCount,
            applicantCountsByPostId
          )
        );
      } catch (error) {
        console.error("Failed to load employer dashboard overview.", error);
      }
    };

    void loadEmployerDashboardOverview();
  }, [isEmployer]);

  useEffect(() => {
    const loadJobPosts = async () => {
      if (!isEmployer) return;

      try {
        const response = await GetMyJobPostsPaged({
          page: jobPostsPage,
          pageSize: LIST_PAGE_SIZE,
          sortBy: "createdAt",
          sortDirection: "desc",
        });

        setJobPosts(response.data.items);
        setJobPostsTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Failed to load employer job posts.", error);
      }
    };

    void loadJobPosts();
  }, [isEmployer, jobPostsPage]);

  useEffect(() => {
    const loadApplicantsWaiting = async () => {
      if (!isEmployer) return;

      try {
        const response = await GetMyJobPostsPaged({
          page: applicantsWaitingPage,
          pageSize: LIST_PAGE_SIZE,
          hasApplicants: true,
          sortBy: "applicantCount",
          sortDirection: "desc",
        });

        setApplicantsWaitingPosts(response.data.items);
        setApplicantsWaitingTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Failed to load applicants waiting posts.", error);
      }
    };

    void loadApplicantsWaiting();
  }, [isEmployer, applicantsWaitingPage]);

  const totalJobPostPages = useMemo(
    () => Math.max(1, Math.ceil(jobPostsTotalCount / LIST_PAGE_SIZE)),
    [jobPostsTotalCount]
  );

  const totalApplicantsWaitingPages = useMemo(
    () => Math.max(1, Math.ceil(applicantsWaitingTotalCount / LIST_PAGE_SIZE)),
    [applicantsWaitingTotalCount]
  );

  const activePostsByLocationId = dashboardSummary?.activePostsByLocationId ?? {};

  const formatLocation = (post: JobPost) => {
    if (!post.restaurantLocationName) {
      return "-";
    }

    return `${post.restaurantLocationName}${
      post.restaurantLocationCity ? ` (${post.restaurantLocationCity})` : ""
    }`;
  };

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPrevious: () => void,
    onNext: () => void
  ) => (
    <div className={styles.paginationRow}>
      <p className={styles.paginationInfo}>
        {t("profile.pageOf", { page: currentPage, totalPages })}
      </p>
      <div className={styles.paginationActions}>
        <button
          type="button"
          className={styles.paginationButton}
          disabled={currentPage <= 1}
          onClick={onPrevious}
        >
          {t("profile.previousPage")}
        </button>
        <button
          type="button"
          className={styles.paginationButton}
          disabled={currentPage >= totalPages}
          onClick={onNext}
        >
          {t("profile.nextPage")}
        </button>
      </div>
    </div>
  );

  if (!isEmployer) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <section className={styles.panel}>
        <h2 className={styles.sectionTitle}>{t("home.activityOverview")}</h2>
        <div className={styles.overviewGrid}>
          <article className={styles.overviewCard}>
            <h4>{t("home.activeJobPosts")}</h4>
            <strong>{dashboardSummary?.activeJobPostsCount ?? 0}</strong>
          </article>
          <article className={styles.overviewCard}>
            <h4>{t("home.totalApplicants")}</h4>
            <strong>{dashboardSummary?.totalApplicantsCount ?? 0}</strong>
          </article>
          <article className={styles.overviewCard}>
            <h4>{t("home.branches")}</h4>
            <strong>{myLocations.length}</strong>
          </article>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.applicantsWaiting")}</h2>
          <Link className={styles.sectionLink} to="/oglasi-za-posao">
            {t("home.viewAllPosts")}
          </Link>
        </div>
        {applicantsWaitingPosts.length === 0 ? (
          <p className={styles.emptyText}>{t("home.noApplicantsWaiting")}</p>
        ) : (
          <div className={styles.cardGrid}>
            {applicantsWaitingPosts.map((post) => (
              <article key={post.id} className={styles.dashboardCard}>
                <h4>{post.title}</h4>
                <div className={styles.meta}>
                  <div>
                    <span>{t("home.location")}: </span>
                    <strong>{formatLocation(post)}</strong>
                  </div>
                  <div>
                    <span>{t("home.applicants")}: </span>
                    <strong>{post.applicantCount ?? 0}</strong>
                  </div>
                </div>
                <EmployerApplicantsPanel jobPostId={post.id} />
              </article>
            ))}
          </div>
        )}
        {applicantsWaitingTotalCount > LIST_PAGE_SIZE &&
          renderPagination(
            applicantsWaitingPage,
            totalApplicantsWaitingPages,
            () => setApplicantsWaitingPage((previous) => Math.max(1, previous - 1)),
            () =>
              setApplicantsWaitingPage((previous) =>
                Math.min(totalApplicantsWaitingPages, previous + 1)
              )
          )}
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.myJobPosts")}</h2>
          <Link className={styles.sectionLink} to="/oglasi-za-posao">
            {t("home.viewAllPosts")}
          </Link>
        </div>
        {jobPosts.length === 0 ? (
          <p className={styles.emptyText}>{t("home.noJobPosts")}</p>
        ) : (
          <div className={styles.cardGrid}>
            {jobPosts.map((post) => (
              <article key={post.id} className={styles.dashboardCard}>
                <h4>{post.title}</h4>
                <div className={styles.meta}>
                  <div>
                    <span>{t("home.position")}: </span>
                    <strong>{post.position}</strong>
                  </div>
                  <div>
                    <span>{t("home.location")}: </span>
                    <strong>{formatLocation(post)}</strong>
                  </div>
                  <div>
                    <span>{t("home.startingDate")}: </span>
                    <strong>{formatDisplayDate(String(post.startingDate)) || "-"}</strong>
                  </div>
                  <div>
                    <span>{t("home.salary")}: </span>
                    <strong>{post.salary} RSD</strong>
                  </div>
                  <div>
                    <span>{t("home.status")}: </span>
                    <strong>{getJobPostDisplayStatusLabel(post, t)}</strong>
                  </div>
                  <div>
                    <span>{t("home.applicants")}: </span>
                    <strong>{post.applicantCount ?? 0}</strong>
                  </div>
                </div>
                <EmployerApplicantsPanel jobPostId={post.id} />
              </article>
            ))}
          </div>
        )}
        {jobPostsTotalCount > LIST_PAGE_SIZE &&
          renderPagination(
            jobPostsPage,
            totalJobPostPages,
            () => setJobPostsPage((previous) => Math.max(1, previous - 1)),
            () => setJobPostsPage((previous) => Math.min(totalJobPostPages, previous + 1))
          )}
      </section>

      <section className={styles.panel}>
        <h2 className={styles.sectionTitle}>{t("home.myRestaurants")}</h2>
        {myLocations.length === 0 ? (
          <p className={styles.emptyText}>{t("home.noBranches")}</p>
        ) : (
          <div className={styles.cardGrid}>
            {myLocations.map((location) => (
              <article key={location.id} className={styles.dashboardCard}>
                <h4>{location.name}</h4>
                <p className={styles.mutedText}>
                  {location.streetName} {location.streetNumber}, {location.city}
                </p>
                <p className={styles.mutedText}>
                  {t("home.activePosts")}: {activePostsByLocationId[location.id] ?? 0}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployerDashboard;
