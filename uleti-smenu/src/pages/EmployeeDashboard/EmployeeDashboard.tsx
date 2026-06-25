import { useContext, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { AuthContext } from "../../store/Auth-context";

import { Employee } from "../../models/User.model";

import { JobPost } from "../../models/JobPost.model";

import { GetVisibleJobPostsPaged } from "../../services/jobPost-service";

import { GetEmployersWithFavouriteStatus } from "../../services/user-service";

import { GetMyWorkExperiences } from "../../services/employee-profile-service";

import { GetMyApplications } from "../../services/application-service";

import { calculateEmployeeProfileCompletion } from "../../helpers/profileCompletion";

import RecommendedJobPostCard from "../../components/EmployeeDashboard/RecommendedJobPostCard";
import RestaurantLogoCarousel from "../../components/EmployeeDashboard/RestaurantLogoCarousel";

import styles from "./EmployeeDashboard.module.scss";



const EmployeeDashboard = () => {

  const { t } = useTranslation();

  const { me } = useContext(AuthContext);

  const employee = me && "firstName" in me ? (me as Employee) : null;



  const [recommendedPosts, setRecommendedPosts] = useState<JobPost[]>([]);

  const [appliedJobPostIds, setAppliedJobPostIds] = useState<string[]>([]);

  const [browseRestaurants, setBrowseRestaurants] = useState<

    { id: string; name: string; profilePhoto?: string; publicSlug?: string; isFavourite: boolean }[]

  >([]);

  const [profileCompletion, setProfileCompletion] = useState(0);

  const [isLoading, setIsLoading] = useState(true);



  const appliedJobPostIdSet = useMemo(() => new Set(appliedJobPostIds), [appliedJobPostIds]);



  useEffect(() => {

    const loadDashboard = async () => {

      if (!employee) {

        setIsLoading(false);

        return;

      }



      try {

        const [postsResponse, restaurantsResponse, workExperienceResponse, applicationsResponse] =

          await Promise.all([

          GetVisibleJobPostsPaged({

            page: 1,

            pageSize: 3,

            sortBy: "createdAt",

            sortDirection: "desc",

            applicationFilter: "all",

          }),

          GetEmployersWithFavouriteStatus(),

          GetMyWorkExperiences(),

          GetMyApplications(),

        ]);



        setRecommendedPosts(postsResponse.data.items);

        setAppliedJobPostIds(

          applicationsResponse.data.map((application) => application.jobPostId).filter(Boolean)

        );

        setBrowseRestaurants(
          restaurantsResponse.data.map((restaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            profilePhoto: restaurant.profilePhoto,
            publicSlug: restaurant.publicSlug,
            isFavourite: restaurant.isFavourite,
          }))
        );

        setProfileCompletion(

          calculateEmployeeProfileCompletion(

            employee,

            workExperienceResponse.data.length > 0

          )

        );

      } catch (error) {

        console.error("Failed to load employee dashboard", error);

        if (employee) {

          setProfileCompletion(calculateEmployeeProfileCompletion(employee, false));

        }

      } finally {

        setIsLoading(false);

      }

    };



    void loadDashboard();

  }, [employee]);



  const handleFavouriteChange = (restaurantId: string, isFavourite: boolean) => {
    setBrowseRestaurants((previous) =>
      previous.map((restaurant) =>
        restaurant.id === restaurantId ? { ...restaurant, isFavourite } : restaurant
      )
    );
  };

  const handleApplied = (jobPostId: string) => {

    setAppliedJobPostIds((previousIds) =>

      previousIds.includes(jobPostId) ? previousIds : [...previousIds, jobPostId]

    );

  };



  if (!employee) {

    return null;

  }



  return (

    <div className={styles.dashboard}>

      <section className={styles.section}>

        <div className={styles.sectionHeader}>

          <h2 className={styles.sectionTitle}>{t("candidate.recommendedPosts")}</h2>

          <Link to="/oglasi-za-posao" className={styles.sectionLink}>

            {t("candidate.viewAll")}

          </Link>

        </div>



        <div className={styles.recommendedGrid}>

          {isLoading

            ? Array.from({ length: 3 }).map((_, index) => (

                <article key={index} className={`${styles.cardSkeleton}`} />

              ))

            : recommendedPosts.length > 0

              ? recommendedPosts.map((post) => (

                  <RecommendedJobPostCard

                    key={post.id}

                    jobPost={post}

                    hasApplied={appliedJobPostIdSet.has(post.id)}

                    onApplied={handleApplied}

                  />

                ))

              : (

                <p className={styles.emptyText}>{t("jobPosts.noPostsAtAll")}</p>

              )}

        </div>

      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("header.restaurants")}</h2>
          <Link to="/restaurants" className={styles.sectionLink}>
            {t("candidate.exploreRestaurants")}
          </Link>
        </div>

        {isLoading ? (
          <div className={styles.carouselSkeleton} />
        ) : browseRestaurants.length > 0 ? (
          <RestaurantLogoCarousel
            restaurants={browseRestaurants}
            onFavouriteChange={handleFavouriteChange}
          />
        ) : (
          <p className={styles.emptyText}>{t("employers.noEmployers")}</p>
        )}
      </section>

      <div className={styles.bottomGrid}>
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t("candidate.updateProfile")}</h2>
          </div>

          <p className={styles.completionLabel}>
            {t("candidate.profileCompletion", { percent: profileCompletion })}
          </p>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <Link to="/profile" className={styles.panelLink}>
            {t("candidate.editProfile")}
          </Link>
        </section>
      </div>

    </div>

  );

};



export default EmployeeDashboard;


