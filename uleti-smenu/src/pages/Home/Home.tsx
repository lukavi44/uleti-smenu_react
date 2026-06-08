import { useMediaQuery } from "@mui/material";
import { useContext, useEffect, useMemo, useState } from "react";
import Footer from "../../components/Footer/Footer";
import JobPosts from "../JobPosts/JobPosts";
import styles from "./Home.module.scss";
import EmployersList from "../../components/Employers/EmployersList";
import { AuthContext } from "../../store/Auth-context";
import { Link } from "react-router-dom";
import {
  GetEmployerDashboardSummary,
  GetMyJobPosts,
  GetMyJobPostsPaged,
} from "../../services/jobPost-service";
import { JobPost } from "../../models/JobPost.model";
import { GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import EmployerApplicantsPanel from "../../components/JobPosts/EmployerApplicantsPanel";
import { EmployerDashboardSummary } from "../../models/EmployerDashboardSummary.model";
import { GetApplicantsForJobPost } from "../../services/application-service";
import {
  buildApplicantCountsFromPosts,
  buildEmployerDashboardSummaryFromPosts,
  normalizeEmployerDashboardSummary,
} from "../../helpers/employerDashboard";
import { useTranslation } from "react-i18next";

const HOME_PAGE_SIZE = 5;

const HomePage = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { authStatus, role } = useContext(AuthContext);
  const canSeeEmployersCarousel =
    authStatus === "authenticated" && role === "Employee";
  const isEmployerDashboardVisible =
    authStatus === "authenticated" && role === "Employer";
  const [dashboardSummary, setDashboardSummary] =
    useState<EmployerDashboardSummary | null>(null);
  const [myLocations, setMyLocations] = useState<RestaurantLocation[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [jobPostsPage, setJobPostsPage] = useState(1);
  const [jobPostsTotalCount, setJobPostsTotalCount] = useState(0);
  const [applicantsWaitingPosts, setApplicantsWaitingPosts] = useState<JobPost[]>([]);
  const [applicantsWaitingPage, setApplicantsWaitingPage] = useState(1);
  const [applicantsWaitingTotalCount, setApplicantsWaitingTotalCount] = useState(0);

  useEffect(() => {
    const loadEmployerDashboardOverview = async () => {
      if (authStatus !== "authenticated" || role !== "Employer") {
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
        const hasApplicantCounts = posts.some(
          (post) => typeof post.applicantCount === "number"
        );

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

    loadEmployerDashboardOverview();
  }, [authStatus, role]);

  useEffect(() => {
    const loadJobPosts = async () => {
      if (!isEmployerDashboardVisible) return;

      try {
        const response = await GetMyJobPostsPaged({
          page: jobPostsPage,
          pageSize: HOME_PAGE_SIZE,
          sortBy: "createdAt",
          sortDirection: "desc",
        });

        setJobPosts(response.data.items);
        setJobPostsTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Failed to load employer job posts.", error);
      }
    };

    loadJobPosts();
  }, [isEmployerDashboardVisible, jobPostsPage]);

  useEffect(() => {
    const loadApplicantsWaiting = async () => {
      if (!isEmployerDashboardVisible) return;

      try {
        const response = await GetMyJobPostsPaged({
          page: applicantsWaitingPage,
          pageSize: HOME_PAGE_SIZE,
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

    loadApplicantsWaiting();
  }, [isEmployerDashboardVisible, applicantsWaitingPage]);

  const totalJobPostPages = useMemo(
    () => Math.max(1, Math.ceil(jobPostsTotalCount / HOME_PAGE_SIZE)),
    [jobPostsTotalCount]
  );

  const totalApplicantsWaitingPages = useMemo(
    () => Math.max(1, Math.ceil(applicantsWaitingTotalCount / HOME_PAGE_SIZE)),
    [applicantsWaitingTotalCount]
  );

  const activePostsByLocationId = dashboardSummary?.activePostsByLocationId ?? {};

  const formatDate = (value: Date) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }
    return parsedDate.toLocaleString();
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
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={currentPage <= 1}
          onClick={onPrevious}
        >
          {t("profile.previousPage")}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={currentPage >= totalPages}
          onClick={onNext}
        >
          {t("profile.nextPage")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <section
        className={`${styles.hero} ${
          isEmployerDashboardVisible ? styles["hero-employer"] : ""
        }`}
      >
        {!isMobile && (
          <div className={styles.content}>
            <div className={styles.left}>
              <p>{t("home.heroTitle")}</p>
              <p className={styles["p-medium"]}>
                {t("home.heroSubtitle")}
              </p>
            </div>
            <div className={styles.right}></div>
          </div>
        )}
        {isMobile && (
          <div className={styles["background-container"]}>
            <div className={styles.content}>
              <div className={styles.left}>
                <p>{t("home.heroTitle")}</p>
                <p className={styles["p-medium"]}>
                  {t("home.heroSubtitle")}
                </p>
              </div>
              <div className={styles.right} />
            </div>
          </div>
        )}
      </section>
      {isEmployerDashboardVisible && (
        <section className={styles.dashboard}>
          <div className={styles.panel}>
            <h2 className={styles["section-title"]}>{t("home.activityOverview")}</h2>
            <div className={styles["overview-grid"]}>
              <article className={styles["overview-card"]}>
                <h4>{t("home.activeJobPosts")}</h4>
                <strong>{dashboardSummary?.activeJobPostsCount ?? 0}</strong>
              </article>
              <article className={styles["overview-card"]}>
                <h4>{t("home.totalApplicants")}</h4>
                <strong>{dashboardSummary?.totalApplicantsCount ?? 0}</strong>
              </article>
              <article className={styles["overview-card"]}>
                <h4>{t("home.branches")}</h4>
                <strong>{myLocations.length}</strong>
              </article>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles["panel-header"]}>
              <h2 className={styles["section-title"]}>{t("home.applicantsWaiting")}</h2>
              <Link className={styles["inline-link"]} to="/oglasi-za-posao">
                {t("home.viewAllPosts")}
              </Link>
            </div>
            {applicantsWaitingPosts.length === 0 && (
              <p className={styles["muted-text"]}>{t("home.noApplicantsWaiting")}</p>
            )}
            <div className={styles["card-grid"]}>
              {applicantsWaitingPosts.map((post) => (
                <article key={post.id} className={styles["dashboard-card"]}>
                  <h4>{post.title}</h4>
                  <div className={styles.meta}>
                    <div>
                      <span>{t("home.location")}:</span>
                      <strong>
                        {post.restaurantLocationName
                          ? `${post.restaurantLocationName}${
                              post.restaurantLocationCity
                                ? ` (${post.restaurantLocationCity})`
                                : ""
                            }`
                          : "-"}
                      </strong>
                    </div>
                    <div>
                      <span>{t("home.applicants")}:</span>
                      <strong>{post.applicantCount ?? 0}</strong>
                    </div>
                  </div>
                  <EmployerApplicantsPanel jobPostId={post.id} />
                </article>
              ))}
            </div>
            {applicantsWaitingTotalCount > HOME_PAGE_SIZE &&
              renderPagination(
                applicantsWaitingPage,
                totalApplicantsWaitingPages,
                () => setApplicantsWaitingPage((previous) => Math.max(1, previous - 1)),
                () =>
                  setApplicantsWaitingPage((previous) =>
                    Math.min(totalApplicantsWaitingPages, previous + 1)
                  )
              )}
          </div>

          <div className={styles.panel}>
            <div className={styles["panel-header"]}>
              <h2 className={styles["section-title"]}>{t("home.myJobPosts")}</h2>
              <Link className={styles["inline-link"]} to="/oglasi-za-posao">
                {t("home.viewAllPosts")}
              </Link>
            </div>
            {jobPosts.length === 0 && (
              <p className={styles["muted-text"]}>{t("home.noJobPosts")}</p>
            )}
            <div className={styles["card-grid"]}>
              {jobPosts.map((post) => (
                <article key={post.id} className={styles["dashboard-card"]}>
                  <h4>{post.title}</h4>
                  <div className={styles.meta}>
                    <div>
                      <span>{t("home.position")}:</span>
                      <strong>{post.position}</strong>
                    </div>
                    <div>
                      <span>{t("home.location")}:</span>
                      <strong>
                        {post.restaurantLocationName
                          ? `${post.restaurantLocationName}${post.restaurantLocationCity ? ` (${post.restaurantLocationCity})` : ""}`
                          : "-"}
                      </strong>
                    </div>
                    <div>
                      <span>{t("home.startingDate")}:</span>
                      <strong>{formatDate(post.startingDate)}</strong>
                    </div>
                    <div>
                      <span>{t("home.salary")}:</span>
                      <strong>{post.salary} RSD</strong>
                    </div>
                    <div>
                      <span>{t("home.status")}:</span>
                      <strong>
                        {post.isArchived ? t("jobPosts.lifecycleArchived") : post.status}
                      </strong>
                    </div>
                    <div>
                      <span>{t("home.applicants")}:</span>
                      <strong>{post.applicantCount ?? 0}</strong>
                    </div>
                  </div>
                  <EmployerApplicantsPanel jobPostId={post.id} />
                </article>
              ))}
            </div>
            {jobPostsTotalCount > HOME_PAGE_SIZE &&
              renderPagination(
                jobPostsPage,
                totalJobPostPages,
                () => setJobPostsPage((previous) => Math.max(1, previous - 1)),
                () => setJobPostsPage((previous) => Math.min(totalJobPostPages, previous + 1))
              )}
          </div>

          <div className={styles.panel}>
            <h2 className={styles["section-title"]}>{t("home.myRestaurants")}</h2>
            {myLocations.length === 0 && (
              <p className={styles["muted-text"]}>{t("home.noBranches")}</p>
            )}
            <div className={styles["card-grid"]}>
              {myLocations.map((location) => (
                <article key={location.id} className={styles["dashboard-card"]}>
                  <h4>{location.name}</h4>
                  <p className={styles["muted-text"]}>
                    {location.streetName} {location.streetNumber}, {location.city}
                  </p>
                  <p className={styles["muted-text"]}>
                    {t("home.activePosts")}: {activePostsByLocationId[location.id] ?? 0}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      {!isMobile && canSeeEmployersCarousel && (
        <section className={styles.employers}>
          <EmployersList />
        </section>
      )}
      {isMobile && !isEmployerDashboardVisible && <JobPosts />}
      <Footer />
    </>
  );
};

export default HomePage;
