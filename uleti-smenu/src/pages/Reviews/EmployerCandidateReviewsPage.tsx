import { useCallback, useContext, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import LoadMoreButton from "../../components/Common/LoadMoreButton";
import RichReviewList from "../../components/Reviews/RichReviewList";
import RestaurantReviewsSummary from "../../components/Reviews/RestaurantReviewsSummary";
import { RichReviewSummary, ReviewSort } from "../../models/RichReview.model";
import { useServerLazyLoad } from "../../hooks/useServerLazyLoad";
import {
  GetCandidateReviews,
  GetCandidateReviewsSummary,
} from "../../services/candidate-review-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./EmployerRestaurantReviewsPage.module.scss";

const PAGE_SIZE = 10;

const EmployerCandidateReviewsPage = () => {
  const { t } = useTranslation();
  const { employeeId } = useParams<{ employeeId: string }>();
  const { authStatus, role } = useContext(AuthContext);
  const isMobile = useMediaQuery("(max-width:1023px)");
  const [summary, setSummary] = useState<RichReviewSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);
  const [sort, setSort] = useState<ReviewSort>("newest");

  const isEmployer = role === "Employer" && authStatus === "authenticated";

  const fetchReviewsPage = useCallback(
    async (page: number) => {
      if (!employeeId) {
        return { items: [], totalCount: 0 };
      }

      const response = await GetCandidateReviews(employeeId, page, PAGE_SIZE, sort);
      return {
        items: response.data.items,
        totalCount: response.data.totalCount,
      };
    },
    [employeeId, sort]
  );

  const {
    items: reviews,
    hasMore,
    loadMore,
    isLoading: reviewsLoading,
    isLoadingMore,
    totalCount,
  } = useServerLazyLoad(
    fetchReviewsPage,
    `${employeeId ?? ""}:${sort}`,
    Boolean(employeeId && isEmployer)
  );

  useEffect(() => {
    if (!employeeId || !isEmployer) {
      return;
    }

    const loadSummary = async () => {
      setSummaryLoading(true);
      setSummaryError(false);

      try {
        const response = await GetCandidateReviewsSummary(employeeId);
        setSummary(response.data);
      } catch {
        setSummary(null);
        setSummaryError(true);
      } finally {
        setSummaryLoading(false);
      }
    };

    void loadSummary();
  }, [employeeId, isEmployer]);

  const handleRetrySummary = () => {
    if (!employeeId) return;
    setSummaryLoading(true);
    setSummaryError(false);
    void GetCandidateReviewsSummary(employeeId)
      .then((response) => setSummary(response.data))
      .catch(() => {
        setSummary(null);
        setSummaryError(true);
      })
      .finally(() => setSummaryLoading(false));
  };

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (!isEmployer) {
    return <Navigate to="/oglasi-za-posao" replace />;
  }

  if (!employeeId) {
    return <div className={styles.page}>{t("candidateReviews.loadError")}</div>;
  }

  const candidateName = summary?.subjectName || t("reviews.unknownSubject");
  const reviewCountLabel = summary?.reviewCount ?? totalCount;

  return (
    <div className={`${styles.page} ${isMobile ? styles.pageMobile : styles.pageDesktop}`}>
      <Link className={styles.backLink} to={`/employees/${employeeId}`}>
        {isMobile ? t("candidateReviews.backMobile") : t("candidateReviews.backDesktop")}
      </Link>

      <header className={styles.header}>
        <h1>{t("candidateReviews.title", { name: candidateName })}</h1>
        {reviewCountLabel > 0 && (
          <p className={styles.ratingPill}>
            ★ {(summary?.averageRating ?? 0).toFixed(1)} · {reviewCountLabel}{" "}
            {t("candidateReviews.reviewCountLabel")}
          </p>
        )}
      </header>

      {summaryLoading && <p className={styles.muted}>{t("common.loading")}</p>}
      {summaryError && !summaryLoading && (
        <div className={styles.errorBox}>
          <p className={styles.muted}>{t("candidateReviews.summaryError")}</p>
          <button type="button" className={styles.retryButton} onClick={handleRetrySummary}>
            {t("candidateReviews.retry")}
          </button>
        </div>
      )}

      {!summaryLoading && !summaryError && summary && (
        <RestaurantReviewsSummary summary={summary} variant={isMobile ? "mobile" : "desktop"} />
      )}

      <section className={styles.listSection}>
        <div className={styles.listHeader}>
          <div>
            <h2>{t("candidateReviews.allReviews")}</h2>
            <p className={styles.listCount}>
              {t("candidateReviews.listCount", { count: totalCount })}
            </p>
          </div>

          <label className={styles.sortField}>
            <span className={styles.sortLabel}>{t("candidateReviews.sortLabel")}</span>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={(event) => setSort(event.target.value as ReviewSort)}
            >
              <option value="newest">{t("candidateReviews.sortNewest")}</option>
              <option value="highest">{t("candidateReviews.sortHighest")}</option>
              <option value="lowest">{t("candidateReviews.sortLowest")}</option>
            </select>
          </label>
        </div>

        {reviewsLoading && reviews.length === 0 && (
          <p className={styles.muted}>{t("common.loading")}</p>
        )}

        {!reviewsLoading && totalCount === 0 && (
          <p className={styles.empty}>{t("candidateReviews.empty")}</p>
        )}

        {reviews.length > 0 && (
          <RichReviewList
            reviews={reviews}
            recommendsLabelKey="candidateReviews.recommends"
            verifiedBadgeMode="whenVerified"
          />
        )}

        <LoadMoreButton
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={loadMore}
          className={styles.loadMore}
        />
      </section>
    </div>
  );
};

export default EmployerCandidateReviewsPage;
