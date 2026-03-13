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

const HomePage = () => {
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
              <p>Uleti smenu!</p>
              <p className={styles["p-medium"]}>
                uzmi lovu, kad kolega ne moze.
              </p>
            </div>
            <div className={styles.right}></div>
          </div>
        )}
        {isMobile && (
          <div className={styles["background-container"]}>
            <div className={styles.content}>
              <div className={styles.left}>
                <p>Uleti smenu!</p>
                <p className={styles["p-medium"]}>
                  uzmi lovu, kad kolega ne moze.
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
            <h2 className={styles["section-title"]}>Activity Overview</h2>
            <div className={styles["overview-grid"]}>
              <article className={styles["overview-card"]}>
                <h4>Active Job Posts</h4>
                <strong>{activeJobPostsCount}</strong>
              </article>
              <article className={styles["overview-card"]}>
                <h4>Total Applicants</h4>
                <strong>{totalApplicantsCount}</strong>
              </article>
              <article className={styles["overview-card"]}>
                <h4>Restaurants / Branches</h4>
                <strong>{myLocations.length}</strong>
              </article>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles["panel-header"]}>
              <h2 className={styles["section-title"]}>Applicants Waiting</h2>
              <Link className={styles["inline-link"]} to="/oglasi-za-posao">
                View all posts
              </Link>
            </div>
            {applicantsWaitingPosts.length === 0 && (
              <p className={styles["muted-text"]}>No applicants waiting right now.</p>
            )}
            <div className={styles["card-grid"]}>
              {applicantsWaitingPosts.map((post) => (
                <article key={post.id} className={styles["dashboard-card"]}>
                  <h4>{post.title}</h4>
                  <div className={styles.meta}>
                    <div>
                      <span>Location:</span>
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
                      <span>Applicants:</span>
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
              <h2 className={styles["section-title"]}>My Job Posts</h2>
              <Link className={styles["inline-link"]} to="/oglasi-za-posao">
                View all posts
              </Link>
            </div>
            {recentJobPosts.length === 0 && (
              <p className={styles["muted-text"]}>No job posts yet.</p>
            )}
            <div className={styles["card-grid"]}>
              {recentJobPosts.map((post) => (
                <article key={post.id} className={styles["dashboard-card"]}>
                  <h4>{post.title}</h4>
                  <div className={styles.meta}>
                    <div>
                      <span>Position:</span>
                      <strong>{post.position}</strong>
                    </div>
                    <div>
                      <span>Location:</span>
                      <strong>
                        {post.restaurantLocationName
                          ? `${post.restaurantLocationName}${post.restaurantLocationCity ? ` (${post.restaurantLocationCity})` : ""}`
                          : "-"}
                      </strong>
                    </div>
                    <div>
                      <span>Starting Date:</span>
                      <strong>{formatDate(post.startingDate)}</strong>
                    </div>
                    <div>
                      <span>Salary:</span>
                      <strong>{post.salary} RSD</strong>
                    </div>
                    <div>
                      <span>Status:</span>
                      <strong>{post.status}</strong>
                    </div>
                    <div>
                      <span>Applicants:</span>
                      <strong>{applicantCountsByPostId[post.id] ?? 0}</strong>
                    </div>
                  </div>
                  <EmployerApplicantsPanel jobPostId={post.id} />
                </article>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <h2 className={styles["section-title"]}>My Restaurants</h2>
            {myLocations.length === 0 && (
              <p className={styles["muted-text"]}>No restaurants/branches yet.</p>
            )}
            <div className={styles["card-grid"]}>
              {myLocations.map((location) => (
                <article key={location.id} className={styles["dashboard-card"]}>
                  <h4>{location.name}</h4>
                  <p className={styles["muted-text"]}>
                    {location.streetName} {location.streetNumber}, {location.city}
                  </p>
                  <p className={styles["muted-text"]}>
                    Active posts: {activePostsByLocationId[location.id] ?? 0}
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
