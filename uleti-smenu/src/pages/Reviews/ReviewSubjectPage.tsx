import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer/Footer";
import ReviewList from "../../components/Reviews/ReviewList";
import { ReviewPage } from "../../models/Review.model";
import { GetEmployeePublicProfile } from "../../services/employee-profile-service";
import { GetEmployeeReviewPage, GetEmployerReviewPage } from "../../services/review-service";
import { GetEmployersWithFavouriteStatus } from "../../services/user-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./ReviewSubjectPage.module.scss";

interface ReviewSubjectPageProps {
  subjectType: "employee" | "employer";
}

const ReviewSubjectPage = ({ subjectType }: ReviewSubjectPageProps) => {
  const { t } = useTranslation();
  const { employeeId, employerId } = useParams();
  const subjectId = subjectType === "employee" ? employeeId : employerId;
  const { authStatus } = useContext(AuthContext);
  const [page, setPage] = useState<ReviewPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      if (!subjectId) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      try {
        const response =
          subjectType === "employee"
            ? await GetEmployeeReviewPage(subjectId)
            : await GetEmployerReviewPage(subjectId);

        let pageData = response.data;

        if (!pageData.subjectName) {
          if (subjectType === "employee") {
            try {
              const profileResponse = await GetEmployeePublicProfile(subjectId);
              pageData = {
                ...pageData,
                subjectName: `${profileResponse.data.firstName} ${profileResponse.data.lastName}`,
              };
            } catch {
              pageData = { ...pageData, subjectName: t("reviews.unknownSubject") };
            }
          } else {
            try {
              const employersResponse = await GetEmployersWithFavouriteStatus();
              const employer = employersResponse.data.find((item) => item.id === subjectId);
              pageData = {
                ...pageData,
                subjectName: employer?.name ?? t("reviews.unknownSubject"),
              };
            } catch {
              pageData = { ...pageData, subjectName: t("reviews.unknownSubject") };
            }
          }
        }

        setPage(pageData);
        setLoadError(false);
      } catch {
        setPage(null);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (authStatus === "authenticated") {
      void loadPage();
    }
  }, [authStatus, subjectId, subjectType]);

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  const backTo =
    subjectType === "employee" && employeeId ? `/employees/${employeeId}` : "/restaurants";

  return (
    <>
      <main className={styles.page}>
        <Link className={styles.backLink} to={backTo}>
          {subjectType === "employee" ? t("reviews.backToProfile") : t("reviews.backToRestaurants")}
        </Link>

        {isLoading && <p className={styles.mutedText}>{t("common.loading")}</p>}
        {loadError && !isLoading && <p className={styles.mutedText}>{t("reviews.loadError")}</p>}

        {!isLoading && !loadError && page && (
          <>
            <header className={styles.header}>
              <h1>
                {subjectType === "employee"
                  ? t("reviews.employeeReviewsTitle", { name: page.subjectName })
                  : t("reviews.restaurantReviewsTitle", { name: page.subjectName })}
              </h1>
              {page.summary.reviewCount > 0 && (
                <p className={styles.summary}>
                  ★ {page.summary.averageRating.toFixed(1)} · {page.summary.reviewCount}{" "}
                  {t("reviews.reviewCountLabel")}
                </p>
              )}
            </header>

            <ReviewList reviews={page.reviews} />
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default ReviewSubjectPage;
