import { useTranslation } from "react-i18next";
import styles from "./JobPostsFiltersBar.module.scss";

export type JobPostsFilterOption = {
  value: string;
  label: string;
};

type JobPostsFiltersBarProps = {
  city: string;
  restaurant: string;
  position: string;
  minSalary: string;
  maxSalary: string;
  lifecycle?: "active" | "archived" | "all";
  applicationFilter?: "all" | "notApplied" | "applied";
  favouriteFilter?: "all" | "favourites";
  sortValue?: string;
  cityOptions: JobPostsFilterOption[];
  restaurantOptions: JobPostsFilterOption[];
  positionOptions: JobPostsFilterOption[];
  showLifecycle?: boolean;
  showApplicationFilters?: boolean;
  showSort?: boolean;
  showSalaryFilters?: boolean;
  sortMode?: "employee" | "employer";
  restaurantLabelKey?: "filterRestaurant" | "filterLocation";
  onCityChange: (value: string) => void;
  onRestaurantChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onMinSalaryChange: (value: string) => void;
  onMaxSalaryChange: (value: string) => void;
  onLifecycleChange?: (value: "active" | "archived" | "all") => void;
  onApplicationFilterChange?: (value: "all" | "notApplied" | "applied") => void;
  onFavouriteFilterChange?: (value: "all" | "favourites") => void;
  onSortChange?: (value: string) => void;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
};

const JobPostsFiltersBar = ({
  city,
  restaurant,
  position,
  minSalary,
  maxSalary,
  lifecycle = "active",
  applicationFilter = "all",
  favouriteFilter = "all",
  sortValue = "createdAt_desc",
  cityOptions,
  restaurantOptions,
  positionOptions,
  showLifecycle = false,
  showApplicationFilters = false,
  showSort = false,
  showSalaryFilters = true,
  sortMode = "employee",
  restaurantLabelKey = "filterRestaurant",
  onCityChange,
  onRestaurantChange,
  onPositionChange,
  onMinSalaryChange,
  onMaxSalaryChange,
  onLifecycleChange,
  onApplicationFilterChange,
  onFavouriteFilterChange,
  onSortChange,
  showClearFilters = false,
  onClearFilters,
}: JobPostsFiltersBarProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.filtersBar}>
      <div className={styles.filtersGrid}>
        {showLifecycle && (
          <div className={styles.filterField}>
            <label htmlFor="jobPostsLifecycleFilter">{t("jobPosts.lifecycleFilter")}</label>
            <select
              id="jobPostsLifecycleFilter"
              className={styles.filterControl}
              value={lifecycle}
              onChange={(event) =>
                onLifecycleChange?.(event.target.value as "active" | "archived" | "all")
              }
            >
              <option value="active">{t("jobPosts.activePosts")}</option>
              <option value="archived">{t("jobPosts.archivedPosts")}</option>
              <option value="all">{t("jobPosts.allPosts")}</option>
            </select>
          </div>
        )}

        {showApplicationFilters && (
          <>
            <div className={styles.filterField}>
              <label htmlFor="jobPostsApplicationFilter">{t("jobPosts.show")}</label>
              <select
                id="jobPostsApplicationFilter"
                className={styles.filterControl}
                value={applicationFilter}
                onChange={(event) =>
                  onApplicationFilterChange?.(event.target.value as "all" | "notApplied" | "applied")
                }
              >
                <option value="all">{t("jobPosts.all")}</option>
                <option value="notApplied">{t("jobPosts.notApplied")}</option>
                <option value="applied">{t("jobPosts.applied")}</option>
              </select>
            </div>
            <div className={styles.filterField}>
              <label htmlFor="jobPostsFavouriteFilter">{t("jobPosts.restaurants")}</label>
              <select
                id="jobPostsFavouriteFilter"
                className={styles.filterControl}
                value={favouriteFilter}
                onChange={(event) =>
                  onFavouriteFilterChange?.(event.target.value as "all" | "favourites")
                }
              >
                <option value="all">{t("jobPosts.all")}</option>
                <option value="favourites">{t("jobPosts.favoritesOnly")}</option>
              </select>
            </div>
          </>
        )}

        <div className={styles.filterField}>
          <label htmlFor="jobPostsCityFilter">{t("jobPosts.filterCity")}</label>
          <select
            id="jobPostsCityFilter"
            className={styles.filterControl}
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
          >
            <option value="">{t("jobPosts.filterAll")}</option>
            {cityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterField}>
          <label htmlFor="jobPostsRestaurantFilter">{t(`jobPosts.${restaurantLabelKey}`)}</label>
          <select
            id="jobPostsRestaurantFilter"
            className={styles.filterControl}
            value={restaurant}
            onChange={(event) => onRestaurantChange(event.target.value)}
          >
            <option value="">{t("jobPosts.filterAll")}</option>
            {restaurantOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterField}>
          <label htmlFor="jobPostsPositionFilter">{t("jobPosts.filterPosition")}</label>
          <select
            id="jobPostsPositionFilter"
            className={styles.filterControl}
            value={position}
            onChange={(event) => onPositionChange(event.target.value)}
          >
            <option value="">{t("jobPosts.filterAll")}</option>
            {positionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showSalaryFilters && (
        <>
        <div className={styles.filterField}>
          <label htmlFor="jobPostsMinSalaryFilter">{t("jobPosts.filterSalaryMin")}</label>
          <input
            id="jobPostsMinSalaryFilter"
            className={styles.filterControl}
            type="number"
            min={0}
            step={100}
            placeholder={t("jobPosts.filterSalaryPlaceholder")}
            value={minSalary}
            onChange={(event) => onMinSalaryChange(event.target.value)}
          />
        </div>

        <div className={styles.filterField}>
          <label htmlFor="jobPostsMaxSalaryFilter">{t("jobPosts.filterSalaryMax")}</label>
          <input
            id="jobPostsMaxSalaryFilter"
            className={styles.filterControl}
            type="number"
            min={0}
            step={100}
            placeholder={t("jobPosts.filterSalaryPlaceholder")}
            value={maxSalary}
            onChange={(event) => onMaxSalaryChange(event.target.value)}
          />
        </div>
        </>
        )}

        {showSort && (
          <div className={styles.filterField}>
            <label htmlFor="jobPostsSortFilter">{t("jobPosts.sort")}</label>
            <select
              id="jobPostsSortFilter"
              className={styles.filterControl}
              value={sortValue}
              onChange={(event) => onSortChange?.(event.target.value)}
            >
              {sortMode === "employer" ? (
                <>
                  <option value="startingDate_asc">{t("jobPosts.sortShiftSoonest")}</option>
                  <option value="startingDate_desc">{t("jobPosts.sortShiftLatest")}</option>
                  <option value="createdAt_desc">{t("jobPosts.newest")}</option>
                  <option value="createdAt_asc">{t("jobPosts.oldest")}</option>
                </>
              ) : (
                <>
                  <option value="createdAt_desc">{t("jobPosts.newest")}</option>
                  <option value="createdAt_asc">{t("jobPosts.oldest")}</option>
                  <option value="salary_desc">{t("jobPosts.salaryHighLow")}</option>
                  <option value="salary_asc">{t("jobPosts.salaryLowHigh")}</option>
                </>
              )}
            </select>
          </div>
        )}
      </div>
      {showClearFilters && onClearFilters && (
        <div className={styles.filtersActions}>
          <button type="button" className={styles.clearFiltersButton} onClick={onClearFilters}>
            {t("jobPosts.clearFilters")}
          </button>
        </div>
      )}
    </div>
  );
};

export default JobPostsFiltersBar;
