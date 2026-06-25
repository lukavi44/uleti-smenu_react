import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer/Footer";
import ReviewList from "../../components/Reviews/ReviewList";
import { ReviewPage } from "../../models/Review.model";
import { GetEmployeePublicProfile } from "../../services/employee-profile-service";
import { ResolveEmployerFromSlug } from "../../services/employer-profile-service";
import { GetEmployeeReviewPage, GetEmployerReviewPage } from "../../services/review-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./ReviewSubjectPage.module.scss";

interface ReviewSubjectPageProps {
  subjectType: "employee" | "employer";
}

const ReviewSubjectPage = ({ subjectType }: ReviewSubjectPageProps) => {
  const { t } = useTranslation();
  const { employeeId, slug } = useParams();
  const { authStatus, role, me } = useContext(AuthContext);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [employerName, setEmployerName] = useState<string | null>(null);
  const [page, setPage] = useState<ReviewPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const resolveEmployer = async () => {
      if (subjectType !== "employer" || !slug) {
        setEmployerId(null);
        setEmployerName(null);
        return;
      }

      setIsLoading(true);
      setLoadError(false);

      try {
        const ownEmployer =
          me && "id" in me && "name" in me
            ? {
                id: String(me.id),
                name: String(me.name),
                publicSlug: "publicSlug" in me ? String(me.publicSlug ?? "") : undefined,
              }
            : undefined;
        const resolved = await ResolveEmployerFromSlug(slug, role ?? undefined, ownEmployer);
        setEmployerId(resolved.employerId);
        setEmployerName(resolved.name);
      } catch {
        setEmployerId(null);
        setEmployerName(null);
        setLoadError(true);
        setIsLoading(false);
      }
    };

    if (authStatus !== "loading") {
      void resolveEmployer();
    }
  }, [authStatus, me, role, slug, subjectType]);

  useEffect(() => {
    const loadPage = async () => {
      if (subjectType === "employer") {
        if (!slug) {
          setLoadError(true);
          setIsLoading(false);
          return;
        }

        if (!employerId) {
          return;
        }
      } else if (!employeeId) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const resolvedSubjectId =
        subjectType === "employee" ? employeeId! : employerId!;

      try {
        const response =
          subjectType === "employee"
            ? await GetEmployeeReviewPage(resolvedSubjectId)
            : await GetEmployerReviewPage(resolvedSubjectId);

        let pageData = response.data;

        if (!pageData.subjectName) {
          if (subjectType === "employee") {
            try {
              const profileResponse = await GetEmployeePublicProfile(resolvedSubjectId);
              pageData = {
                ...pageData,
                subjectName: `${profileResponse.data.firstName} ${profileResponse.data.lastName}`,
              };
            } catch {
              pageData = { ...pageData, subjectName: t("reviews.unknownSubject") };
            }
          } else {
            pageData = {
              ...pageData,
              subjectName: employerName ?? t("reviews.unknownSubject"),
            };
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

    if (authStatus !== "loading") {
      void loadPage();
    }
  }, [authStatus, employeeId, employerId, employerName, slug, subjectType, t]);

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated" && subjectType === "employee") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  const backTo =
    subjectType === "employee" && employeeId
      ? `/employees/${employeeId}`
      : slug &&
          me &&
          "publicSlug" in me &&
          slug.trim().toLowerCase() === String(me.publicSlug ?? "").trim().toLowerCase()
        ? "/profile"
        : slug
          ? `/restaurants/${slug}`
          : "/restaurants";

  return (
    <>
      <main className={styles.page}>
        <Link className={styles.backLink} to={backTo}>
          {subjectType === "employee" ? t("reviews.backToProfile") : t("reviews.backToEmployerProfile")}
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
