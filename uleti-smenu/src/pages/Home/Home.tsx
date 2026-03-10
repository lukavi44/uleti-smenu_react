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

const HomePage = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const { authStatus, role } = useContext(AuthContext);
  const canSeeEmployersCarousel =
    authStatus === "authenticated" && role === "Employee";
  const isEmployerDashboardVisible =
    authStatus === "authenticated" && role === "Employer";
  const [myJobPosts, setMyJobPosts] = useState<JobPost[]>([]);
  const [myLocations, setMyLocations] = useState<RestaurantLocation[]>([]);

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
      } catch (error) {
        console.error("Failed to load employer dashboard data.", error);
      }
    };

    loadEmployerDashboardData();
  }, [isEmployerDashboardVisible]);

  const recentJobPosts = useMemo(() => myJobPosts.slice(0, 5), [myJobPosts]);

  const formatDate = (value: Date) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }
    return parsedDate.toLocaleString();
  };

  return (
    <>
      <section className={styles.hero}>
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
            <h2 className={styles["section-title"]}>Quick Actions</h2>
            <div className={styles["quick-actions"]}>
              <Link className={`${styles.button} ${styles["button-primary"]}`} to="/oglasi-za-posao">
                Create Job Post
              </Link>
              <Link className={`${styles.button} ${styles["button-secondary"]}`} to="/oglasi-za-posao">
                My Job Posts (Oglasi)
              </Link>
              <Link className={`${styles.button} ${styles["button-secondary"]}`} to="/profile">
                Profile
              </Link>
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
                  </div>
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
