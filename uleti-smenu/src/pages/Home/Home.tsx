import { useMediaQuery } from "@mui/material";
import { useContext, useEffect, useMemo, useState } from "react";
import Footer from "../../components/Footer/Footer";
import JobPosts from "../JobPosts/JobPosts";
import styles from "./Home.module.scss";
import EmployersList from "../../components/Employers/EmployersList";
import { AuthContext } from "../../store/Auth-context";
import { Link } from "react-router-dom";
import { GetMyJobPosts } from "../../services/jobPost-service";
import { JobPost } from "../../models/JobPost.model";
import { GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import EmployerApplicantsPanel from "../../components/JobPosts/EmployerApplicantsPanel";
import { GetApplicantsForJobPost } from "../../services/application-service";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { authStatus, role } = useContext(AuthContext);
  const canSeeEmployersCarousel =
    authStatus === "authenticated" && role === "Employee";
  const isEmployerDashboardVisible =
    authStatus === "authenticated" && role === "Employer";
  const [myJobPosts, setMyJobPosts] = useState<JobPost[]>([]);
  const [myLocations, setMyLocations] = useState<RestaurantLocation[]>([]);
  const [applicantCountsByPostId, setApplicantCountsByPostId] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const loadEmployerDashboardData = async () => {
      if (!isEmployerDashboardVisible) return;

      try {
        const [jobPostsResponse, locationsResponse] = await Promise.all([
          GetMyJobPosts(),
          GetMyRestaurantLocations(),
        ]);

        setMyJobPosts(jobPostsResponse.data);
        setMyLocations(locationsResponse.data);

        const applicantCountEntries = await Promise.all(
          jobPostsResponse.data.map(async (post) => {
            try {
              const applicantsResponse = await GetApplicantsForJobPost(post.id);
              return [post.id, applicantsResponse.data.length] as const;
            } catch {
              return [post.id, 0] as const;
            }
          })
        );

        setApplicantCountsByPostId(Object.fromEntries(applicantCountEntries));
      } catch (error) {
        console.error("Failed to load employer dashboard data.", error);
      }
    };

    loadEmployerDashboardData();
  }, [isEmployerDashboardVisible]);

  const recentJobPosts = useMemo(() => myJobPosts.slice(0, 5), [myJobPosts]);
  const activeJobPostsCount = useMemo(
    () => myJobPosts.filter((post) => post.status === "Active").length,
    [myJobPosts]
  );
  const applicantsWaitingPosts = useMemo(
    () =>
      myJobPosts
        .filter((post) => (applicantCountsByPostId[post.id] ?? 0) > 0)
        .sort(
          (firstPost, secondPost) =>
            (applicantCountsByPostId[secondPost.id] ?? 0) -
            (applicantCountsByPostId[firstPost.id] ?? 0)
        )
        .slice(0, 5),
    [myJobPosts, applicantCountsByPostId]
  );
  const totalApplicantsCount = useMemo(
    () =>
      myJobPosts.reduce(
        (count, post) => count + (applicantCountsByPostId[post.id] ?? 0),
        0
      ),
    [myJobPosts, applicantCountsByPostId]
  );
  const activePostsByLocationId = useMemo(() => {
    const counts: Record<string, number> = {};
    myJobPosts.forEach((post) => {
      if (!post.restaurantLocationId || post.status !== "Active") return;
      counts[post.restaurantLocationId] =
        (counts[post.restaurantLocationId] ?? 0) + 1;
    });
    return counts;
  }, [myJobPosts]);

  const formatDate = (value: Date) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }
    return parsedDate.toLocaleString();
  };

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
                <strong>{activeJobPostsCount}</strong>
              </article>
              <article className={styles["overview-card"]}>
                <h4>{t("home.totalApplicants")}</h4>
                <strong>{totalApplicantsCount}</strong>
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
                      <strong>{applicantCountsByPostId[post.id] ?? 0}</strong>
                    </div>
                  </div>
                  <EmployerApplicantsPanel jobPostId={post.id} />
                </article>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles["panel-header"]}>
              <h2 className={styles["section-title"]}>{t("home.myJobPosts")}</h2>
              <Link className={styles["inline-link"]} to="/oglasi-za-posao">
                {t("home.viewAllPosts")}
              </Link>
            </div>
            {recentJobPosts.length === 0 && (
              <p className={styles["muted-text"]}>{t("home.noJobPosts")}</p>
            )}
            <div className={styles["card-grid"]}>
              {recentJobPosts.map((post) => (
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
                      <strong>{post.status}</strong>
                    </div>
                    <div>
                      <span>{t("home.applicants")}:</span>
                      <strong>{applicantCountsByPostId[post.id] ?? 0}</strong>
                    </div>
                  </div>
                  <EmployerApplicantsPanel jobPostId={post.id} />
                </article>
              ))}
            </div>
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
