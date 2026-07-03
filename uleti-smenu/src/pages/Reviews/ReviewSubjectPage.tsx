import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import RichReviewList from "../../components/Reviews/RichReviewList";
import RestaurantReviewsSummary from "../../components/Reviews/RestaurantReviewsSummary";
import {
  mapReviewPageToRichSummary,
  mapReviewToRichItem,
  sortRichReviews,
} from "../../helpers/mapReviewPageToRich";
import { ReviewPage } from "../../models/Review.model";
import { ReviewSort } from "../../models/RichReview.model";
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
  const isMobile = useMediaQuery("(max-width:1023px)");
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [employerName, setEmployerName] = useState<string | null>(null);
  const [page, setPage] = useState<ReviewPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sort, setSort] = useState<ReviewSort>("newest");

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

      const resolvedSubjectId = subjectType === "employee" ? employeeId! : employerId!;

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

  const isOwnEmployeeProfile =
    subjectType === "employee" &&
    authStatus === "authenticated" &&
    role === "Employee" &&
    me &&
    "id" in me &&
    employeeId &&
    String(me.id) === employeeId;

  const backTo = useMemo(() => {
    if (isOwnEmployeeProfile) {
      return "/profile";
    }

    if (subjectType === "employee" && employeeId) {
      return `/employees/${employeeId}`;
    }

    if (
      slug &&
      me &&
      "publicSlug" in me &&
      slug.trim().toLowerCase() === String(me.publicSlug ?? "").trim().toLowerCase()
    ) {
      return "/profile";
    }

    return slug ? `/restaurants/${slug}` : "/restaurants";
  }, [employeeId, isOwnEmployeeProfile, me, slug, subjectType]);

  const richSummary = useMemo(() => (page ? mapReviewPageToRichSummary(page) : null), [page]);

  const sortedReviews = useMemo(() => {
    if (!page) {
      return [];
    }

    return sortRichReviews(page.reviews.map(mapReviewToRichItem), sort);
  }, [page, sort]);

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated" && subjectType === "employee") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  const reviewCountLabel = page?.summary.reviewCount ?? 0;
  const pageTitle =
    subjectType === "employee"
      ? t("reviews.employeeReviewsTitle", { name: page?.subjectName ?? "" })
      : t("reviews.restaurantReviewsTitle", { name: page?.subjectName ?? "" });

  return (
    <div className={`${styles.page} ${isMobile ? styles.pageMobile : styles.pageDesktop}`}>
      <Link className={styles.backLink} to={backTo}>
        {isOwnEmployeeProfile
          ? t("reviews.backToProfile")
          : subjectType === "employee"
            ? t("reviews.backToProfile")
            : isMobile
              ? t("restaurantReviews.backMobile")
              : t("restaurantReviews.backDesktop")}
      </Link>

      {isLoading && <p className={styles.muted}>{t("common.loading")}</p>}
      {loadError && !isLoading && <p className={styles.muted}>{t("reviews.loadError")}</p>}

      {!isLoading && !loadError && page && (
        <>
          <header className={styles.header}>
            <h1>{pageTitle}</h1>
            {reviewCountLabel > 0 && (
              <p className={styles.ratingPill}>
                ★ {page.summary.averageRating.toFixed(1)} · {reviewCountLabel}{" "}
                {t("restaurantReviews.reviewCountLabel")}
              </p>
            )}
          </header>

          {richSummary && (
            <RestaurantReviewsSummary summary={richSummary} variant={isMobile ? "mobile" : "desktop"} />
          )}

          <section className={styles.listSection}>
            <div className={styles.listHeader}>
              <div>
                <h2>{t("restaurantReviews.allReviews")}</h2>
                <p className={styles.listCount}>
                  {t("restaurantReviews.listCount", { count: reviewCountLabel })}
                </p>
              </div>

              <label className={styles.sortField}>
                <span className={styles.sortLabel}>{t("restaurantReviews.sortLabel")}</span>
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(event) => setSort(event.target.value as ReviewSort)}
                >
                  <option value="newest">{t("restaurantReviews.sortNewest")}</option>
                  <option value="highest">{t("restaurantReviews.sortHighest")}</option>
                  <option value="lowest">{t("restaurantReviews.sortLowest")}</option>
                </select>
              </label>
            </div>

            {reviewCountLabel === 0 && <p className={styles.empty}>{t("reviews.noReviews")}</p>}

            {sortedReviews.length > 0 && (
              <RichReviewList
                reviews={sortedReviews}
                recommendsLabelKey={
                  subjectType === "employee" ? "candidateReviews.recommends" : "restaurantReviews.recommends"
                }
                verifiedBadgeMode="whenVerified"
              />
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default ReviewSubjectPage;
