import { useCallback, useContext, useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import { EmployerDirectoryPreview } from "../../models/EmployerDirectoryPreview.model";
import { ReviewSummary } from "../../models/Review.model";
import { GetEmployerCities } from "../../services/user-service";
import { GetEmployerDirectoryPaged } from "../../services/employer-profile-service";
import { GetEmployerReviewSummary } from "../../services/review-service";
import { RESTAURANTS_PAGE_SIZE } from "../../constants/pagination";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useServerLazyLoad } from "../../hooks/useServerLazyLoad";
import LazyLoadSentinel from "../Common/LazyLoadSentinel";
import RestaurantDirectoryCard from "./RestaurantDirectoryCard";
import styles from "./RestaurantsDirectory.module.scss";

const SEARCH_DEBOUNCE_MS = 350;

type RestaurantListItem = EmployerDirectoryPreview & { id: string };

const RestaurantsDirectory = () => {
  const { t } = useTranslation();
  const { authStatus, role, me } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [reviewSummaries, setReviewSummaries] = useState<Record<string, ReviewSummary>>({});
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const canViewProfile =
    authStatus === "unauthenticated" ||
    (authStatus === "authenticated" && (role === "Employee" || role === "Employer"));
  const showJobPostsCount = role !== "Employer";
  const myEmployerId = me && "id" in me ? String(me.id) : undefined;

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await GetEmployerCities();
        setCities(response.data);
      } catch {
        setCities([]);
      }
    };

    void loadCities();
  }, []);

  const resetKey = `${selectedCity}|${debouncedSearch}`;
  const fetchPage = useCallback(
    async (page: number) => {
      const response = await GetEmployerDirectoryPaged({
        page,
        pageSize: RESTAURANTS_PAGE_SIZE,
        city: selectedCity || undefined,
        search: debouncedSearch || undefined,
      });

      return {
        items: response.data.items.map((item) => ({
          ...item,
          id: item.employerId,
        })),
        totalCount: response.data.totalCount,
      };
    },
    [selectedCity, debouncedSearch]
  );

  const {
    items: restaurants,
    hasMore,
    loadMore,
    isLoading,
    isLoadingMore,
    totalCount,
  } = useServerLazyLoad<RestaurantListItem>(fetchPage, resetKey);

  useEffect(() => {
    if (restaurants.length === 0) {
      setReviewSummaries({});
      return;
    }

    const loadSummaries = async () => {
      const entries = await Promise.all(
        restaurants.map(async (restaurant) => {
          if (restaurant.reviewSummary.reviewCount > 0) {
            return [restaurant.employerId, restaurant.reviewSummary] as const;
          }

          try {
            const response = await GetEmployerReviewSummary(restaurant.employerId);
            return [restaurant.employerId, response.data] as const;
          } catch {
            return [restaurant.employerId, restaurant.reviewSummary] as const;
          }
        })
      );

      setReviewSummaries(Object.fromEntries(entries));
    };

    void loadSummaries();
  }, [restaurants]);

  const hasActiveFilters = Boolean(selectedCity) || Boolean(debouncedSearch);

  return (
    <section className={styles.section}>
      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <MagnifyingGlassIcon className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("restaurants.searchPlaceholder")}
            aria-label={t("restaurants.searchPlaceholder")}
          />
        </label>

        <select
          className={styles.citySelect}
          value={selectedCity}
          onChange={(event) => setSelectedCity(event.target.value)}
          aria-label={t("employers.filterByCity")}
        >
          <option value="">{t("employers.allCities")}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {!isLoading && totalCount > 0 ? (
        <p className={styles.resultsCount}>
          {t("restaurants.shownCount", { count: totalCount })}
        </p>
      ) : null}

      {isLoading && restaurants.length === 0 ? (
        <p className={styles.stateMessage}>{t("common.loading")}</p>
      ) : null}

      {!isLoading && restaurants.length === 0 ? (
        <p className={styles.stateMessage}>
          {hasActiveFilters ? t("restaurants.noResults") : t("employers.noEmployers")}
        </p>
      ) : null}

      {restaurants.length > 0 ? (
        <>
          <div className={styles.grid}>
            {restaurants.map((restaurant) => {
              const reviewSummary =
                reviewSummaries[restaurant.employerId] ?? restaurant.reviewSummary;

              return (
                <RestaurantDirectoryCard
                  key={restaurant.employerId}
                  restaurant={{ ...restaurant, reviewSummary }}
                  canViewProfile={canViewProfile}
                  showJobPostsCount={showJobPostsCount}
                  myEmployerId={myEmployerId}
                  role={role ?? undefined}
                />
              );
            })}
          </div>
          <LazyLoadSentinel
            hasMore={hasMore}
            onLoadMore={loadMore}
            visibleCount={restaurants.length}
            totalCount={totalCount}
            isLoading={isLoading || isLoadingMore}
          />
        </>
      ) : null}
    </section>
  );
};

export default RestaurantsDirectory;
