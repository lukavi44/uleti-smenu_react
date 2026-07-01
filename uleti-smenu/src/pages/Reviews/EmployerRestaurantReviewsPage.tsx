import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import LoadMoreButton from "../../components/Common/LoadMoreButton";
import RichReviewList from "../../components/Reviews/RichReviewList";
import RestaurantReviewsSummary from "../../components/Reviews/RestaurantReviewsSummary";
import {
  RichReviewSummary,
  ReviewSort,
} from "../../models/RichReview.model";
import { getRestaurantProfilePath } from "../../helpers/restaurantPaths";
import { useServerLazyLoad } from "../../hooks/useServerLazyLoad";
import {
  GetEmployerRestaurantReviews,
  GetEmployerRestaurantReviewsSummary,
} from "../../services/employer-restaurant-review-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./EmployerRestaurantReviewsPage.module.scss";

const PAGE_SIZE = 10;

const EmployerRestaurantReviewsPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { authStatus, role, me } = useContext(AuthContext);
  const isMobile = useMediaQuery("(max-width:1023px)");
  const [summary, setSummary] = useState<RichReviewSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);
  const [sort, setSort] = useState<ReviewSort>("newest");

  const ownEmployer =
    me && "id" in me && "publicSlug" in me
      ? {
          id: String(me.id),
          publicSlug: String(me.publicSlug ?? ""),
        }
      : undefined;

  const isOwnRestaurant =
    role === "Employer" &&
    authStatus === "authenticated" &&
    ownEmployer &&
    slug &&
    ownEmployer.publicSlug.trim().toLowerCase() === slug.trim().toLowerCase();

  const backPath = useMemo(() => {
    if (!ownEmployer || !slug) {
      return "/profile";
    }

    return getRestaurantProfilePath(
      { id: ownEmployer.id, publicSlug: slug },
      { myId: ownEmployer.id, role: "Employer" }
    );
  }, [ownEmployer, slug]);

  const fetchReviewsPage = useCallback(
    async (page: number) => {
      if (!slug) {
        return { items: [], totalCount: 0 };
      }

      const response = await GetEmployerRestaurantReviews(slug, page, PAGE_SIZE, sort);
      return {
        items: response.data.items,
        totalCount: response.data.totalCount,
      };
    },
    [slug, sort]
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
    `${slug ?? ""}:${sort}`,
    Boolean(slug && isOwnRestaurant)
  );

  useEffect(() => {
    if (!slug || !isOwnRestaurant) {
      return;
    }

    const loadSummary = async () => {
      setSummaryLoading(true);
      setSummaryError(false);

      try {
        const response = await GetEmployerRestaurantReviewsSummary(slug);
        setSummary(response.data);
      } catch {
        setSummary(null);
        setSummaryError(true);
      } finally {
        setSummaryLoading(false);
      }
    };

    void loadSummary();
  }, [isOwnRestaurant, slug]);

  const handleRetrySummary = () => {
    if (!slug) return;
    setSummaryLoading(true);
    setSummaryError(false);
    void GetEmployerRestaurantReviewsSummary(slug)
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

  if (!isOwnRestaurant) {
    return <Navigate to="/profile" replace />;
  }

  if (!slug) {
    return <div className={styles.page}>{t("restaurantReviews.loadError")}</div>;
  }

  const restaurantName = summary?.subjectName || t("reviews.unknownSubject");
  const reviewCountLabel = summary?.reviewCount ?? totalCount;

  return (
    <div className={`${styles.page} ${isMobile ? styles.pageMobile : styles.pageDesktop}`}>
      <Link className={styles.backLink} to={backPath}>
        {isMobile ? t("restaurantReviews.backMobile") : t("restaurantReviews.backDesktop")}
      </Link>

      <header className={styles.header}>
        <h1>{t("restaurantReviews.title", { name: restaurantName })}</h1>
        {reviewCountLabel > 0 && (
          <p className={styles.ratingPill}>
            ★ {(summary?.averageRating ?? 0).toFixed(1)} · {reviewCountLabel}{" "}
            {t("restaurantReviews.reviewCountLabel")}
          </p>
        )}
      </header>

      {summaryLoading && <p className={styles.muted}>{t("common.loading")}</p>}
      {summaryError && !summaryLoading && (
        <div className={styles.errorBox}>
          <p className={styles.muted}>{t("restaurantReviews.summaryError")}</p>
          <button type="button" className={styles.retryButton} onClick={handleRetrySummary}>
            {t("restaurantReviews.retry")}
          </button>
        </div>
      )}

      {!summaryLoading && !summaryError && summary && (
        <RestaurantReviewsSummary summary={summary} variant={isMobile ? "mobile" : "desktop"} />
      )}

      <section className={styles.listSection}>
        <div className={styles.listHeader}>
          <div>
            <h2>{t("restaurantReviews.allReviews")}</h2>
            <p className={styles.listCount}>
              {t("restaurantReviews.listCount", { count: totalCount })}
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

        {reviewsLoading && reviews.length === 0 && (
          <p className={styles.muted}>{t("common.loading")}</p>
        )}

        {!reviewsLoading && totalCount === 0 && (
          <p className={styles.empty}>{t("restaurantReviews.empty")}</p>
        )}

        {reviews.length > 0 && <RichReviewList reviews={reviews} />}

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

export default EmployerRestaurantReviewsPage;
