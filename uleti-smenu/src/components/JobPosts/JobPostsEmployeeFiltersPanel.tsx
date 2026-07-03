import { useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ShiftDatePreset } from "../../helpers/shiftDateFilter";
import styles from "./JobPostsEmployeeFiltersPanel.module.scss";

const POSITIONS_PREVIEW_COUNT = 4;
const SALARY_STEP = 100;

export type JobPostsEmployeeFiltersPanelProps = {
  city: string;
  cityOptions: Array<{ value: string; label: string }>;
  selectedPositions: string[];
  positionOptions: string[];
  salaryMin: number;
  salaryMax: number;
  salaryBounds: { min: number; max: number };
  shiftDatePreset: ShiftDatePreset;
  shiftDateCustom: string;
  favouritesOnly: boolean;
  hideAppliedPosts: boolean;
  onCityChange: (value: string) => void;
  onPositionToggle: (position: string) => void;
  onSalaryChange: (min: number, max: number) => void;
  onShiftDatePresetChange: (preset: ShiftDatePreset) => void;
  onShiftDateCustomChange: (value: string) => void;
  onFavouritesOnlyChange: (value: boolean) => void;
  onHideAppliedPostsChange: (value: boolean) => void;
  showApplicationToggles?: boolean;
};

const formatSalary = (value: number) => `${value.toLocaleString("sr-RS")} RSD`;

const JobPostsEmployeeFiltersPanel = ({
  city,
  cityOptions,
  selectedPositions,
  positionOptions,
  salaryMin,
  salaryMax,
  salaryBounds,
  shiftDatePreset,
  shiftDateCustom,
  favouritesOnly,
  hideAppliedPosts,
  onCityChange,
  onPositionToggle,
  onSalaryChange,
  onShiftDatePresetChange,
  onShiftDateCustomChange,
  onFavouritesOnlyChange,
  onHideAppliedPostsChange,
  showApplicationToggles = true,
}: JobPostsEmployeeFiltersPanelProps) => {
  const { t } = useTranslation();
  const [positionsExpanded, setPositionsExpanded] = useState(true);
  const [showAllPositions, setShowAllPositions] = useState(false);

  const visiblePositions = useMemo(() => {
    if (showAllPositions) {
      return positionOptions;
    }

    return positionOptions.slice(0, POSITIONS_PREVIEW_COUNT);
  }, [positionOptions, showAllPositions]);

  const hasMorePositions = positionOptions.length > POSITIONS_PREVIEW_COUNT;
  const salaryRangePercent = (value: number) => {
    const span = salaryBounds.max - salaryBounds.min || 1;
    return ((value - salaryBounds.min) / span) * 100;
  };

  const handleMinSalaryChange = (nextMin: number) => {
    const clampedMin = Math.min(Math.max(nextMin, salaryBounds.min), salaryMax);
    onSalaryChange(clampedMin, salaryMax);
  };

  const handleMaxSalaryChange = (nextMax: number) => {
    const clampedMax = Math.max(Math.min(nextMax, salaryBounds.max), salaryMin);
    onSalaryChange(salaryMin, clampedMax);
  };

  const handlePresetChange = (preset: ShiftDatePreset) => {
    onShiftDatePresetChange(preset);
    if (preset !== "any") {
      onShiftDateCustomChange("");
    }
  };

  const handleCustomDateChange = (value: string) => {
    onShiftDateCustomChange(value);
    if (value) {
      onShiftDatePresetChange("any");
    }
  };

  const shiftPresets: Array<{ id: ShiftDatePreset; label: string }> = [
    { id: "any", label: t("jobPosts.shiftDateAny") },
    { id: "today", label: t("jobPosts.shiftDateToday") },
    { id: "tomorrow", label: t("jobPosts.shiftDateTomorrow") },
    { id: "week", label: t("jobPosts.shiftDateThisWeek") },
  ];

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <button
          type="button"
          className={styles.sectionHeader}
          onClick={() => setPositionsExpanded((current) => !current)}
          aria-expanded={positionsExpanded}
        >
          <span>{t("jobPosts.filterPosition")}</span>
          {positionsExpanded ? (
            <ChevronUpIcon className={styles.sectionChevron} aria-hidden="true" />
          ) : (
            <ChevronDownIcon className={styles.sectionChevron} aria-hidden="true" />
          )}
        </button>

        {positionsExpanded ? (
          <div className={styles.sectionBody}>
            <div className={styles.checkboxList}>
              {visiblePositions.map((position) => {
                const checked = selectedPositions.includes(position);
                const inputId = `employee-filter-position-${position.replace(/\s+/g, "-")}`;
                return (
                  <div key={position} className={styles.checkboxRow}>
                    <input
                      id={inputId}
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={checked}
                      onChange={() => onPositionToggle(position)}
                    />
                    <label htmlFor={inputId} className={styles.checkboxLabel}>
                      {position}
                    </label>
                  </div>
                );
              })}
            </div>
            {hasMorePositions ? (
              <button
                type="button"
                className={styles.showMoreButton}
                onClick={() => setShowAllPositions((current) => !current)}
              >
                {showAllPositions ? t("jobPosts.showLess") : t("jobPosts.showMore")}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="employeeFiltersCity">
          {t("jobPosts.filterCity")}
        </label>
        <div className={styles.selectWrap}>
          <MapPinIcon className={styles.selectIcon} aria-hidden="true" />
          <select
            id="employeeFiltersCity"
            className={styles.selectControl}
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
          >
            <option value="">{t("jobPosts.filterAllCities")}</option>
            {cityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.fieldLabelRow}>
          <span className={styles.fieldLabel}>{t("jobPosts.dailyWage")}</span>
          <span className={styles.salaryBadge}>
            {formatSalary(salaryMin)} - {formatSalary(salaryMax)}
          </span>
        </div>
        <div className={styles.rangeSlider}>
          <div className={styles.rangeTrack}>
            <div
              className={styles.rangeFill}
              style={{
                left: `${salaryRangePercent(salaryMin)}%`,
                right: `${100 - salaryRangePercent(salaryMax)}%`,
              }}
            />
          </div>
          <input
            type="range"
            className={styles.rangeInput}
            min={salaryBounds.min}
            max={salaryBounds.max}
            step={SALARY_STEP}
            value={salaryMin}
            onChange={(event) => handleMinSalaryChange(Number(event.target.value))}
            aria-label={t("jobPosts.filterSalaryMin")}
          />
          <input
            type="range"
            className={styles.rangeInput}
            min={salaryBounds.min}
            max={salaryBounds.max}
            step={SALARY_STEP}
            value={salaryMax}
            onChange={(event) => handleMaxSalaryChange(Number(event.target.value))}
            aria-label={t("jobPosts.filterSalaryMax")}
          />
        </div>
        <div className={styles.rangeLabels}>
          <span>{formatSalary(salaryBounds.min)}</span>
          <span>{formatSalary(salaryBounds.max)}+</span>
        </div>
      </section>

      <section className={styles.section}>
        <span className={styles.fieldLabel}>{t("jobPosts.shiftDate")}</span>
        <div className={styles.pillRow}>
          {shiftPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`${styles.pill} ${
                !shiftDateCustom && shiftDatePreset === preset.id ? styles.pillActive : ""
              }`}
              onClick={() => handlePresetChange(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <label className={styles.dateField}>
          <input
            type="date"
            className={styles.dateInput}
            value={shiftDateCustom}
            onChange={(event) => handleCustomDateChange(event.target.value)}
            aria-label={t("jobPosts.pickShiftDate")}
          />
          <span className={styles.datePlaceholder}>
            {shiftDateCustom ? "" : t("jobPosts.pickShiftDate")}
          </span>
        </label>
      </section>

      {showApplicationToggles ? (
      <section className={styles.section}>
        <div className={styles.toggleRow}>
          <label className={styles.toggle} htmlFor="employee-filter-favourites">
            <input
              id="employee-filter-favourites"
              type="checkbox"
              className={styles.toggleInput}
              checked={favouritesOnly}
              onChange={(event) => onFavouritesOnlyChange(event.target.checked)}
            />
            <span className={styles.toggleTrack} aria-hidden="true" />
          </label>
          <label htmlFor="employee-filter-favourites" className={styles.toggleLabel}>
            {t("jobPosts.favoritesOnly")}
          </label>
        </div>
        <div className={styles.toggleRow}>
          <label className={styles.toggle} htmlFor="employee-filter-hide-applied">
            <input
              id="employee-filter-hide-applied"
              type="checkbox"
              className={styles.toggleInput}
              checked={hideAppliedPosts}
              onChange={(event) => onHideAppliedPostsChange(event.target.checked)}
            />
            <span className={styles.toggleTrack} aria-hidden="true" />
          </label>
          <label htmlFor="employee-filter-hide-applied" className={styles.toggleLabel}>
            {t("jobPosts.hideAppliedPosts")}
          </label>
        </div>
      </section>
      ) : null}
    </div>
  );
};

export default JobPostsEmployeeFiltersPanel;
