import { TFunction } from "i18next";

import { ShiftDatePreset, isShiftDateFilterActive } from "./shiftDateFilter";



export type ActiveJobPostFilterChip = {

  id: string;

  label: string;

};



type EmployeeFilterState = {

  city: string;

  restaurant: string;

  selectedPositions: string[];

  salaryMin: number;

  salaryMax: number;

  salaryBounds: { min: number; max: number };

  shiftDatePreset: ShiftDatePreset;

  shiftDateCustom: string;

  applicationFilter: "all" | "notApplied" | "applied";

  favouritesOnly: boolean;

  hideAppliedPosts?: boolean;

  sortBy: "createdAt" | "salary";

  sortDirection: "asc" | "desc";

  restaurantOptions: Array<{ value: string; label: string }>;

  positionFilter?: string;

  minSalaryInput?: string;

  maxSalaryInput?: string;

  favouriteFilter?: "all" | "favourites";

  useCandidateFilters?: boolean;

};



const formatSalary = (value: number) => value.toLocaleString("sr-RS");



export const buildEmployeeActiveFilterChips = (

  filters: EmployeeFilterState,

  t: TFunction

): ActiveJobPostFilterChip[] => {

  const chips: ActiveJobPostFilterChip[] = [];



  if (filters.city) {

    chips.push({ id: "city", label: filters.city });

  }



  if (filters.restaurant) {

    const restaurantLabel =

      filters.restaurantOptions.find((option) => option.value === filters.restaurant)?.label ??

      filters.restaurant;

    chips.push({ id: "restaurant", label: restaurantLabel });

  }



  if (filters.useCandidateFilters) {

    filters.selectedPositions.forEach((position) => {

      chips.push({ id: `position:${position}`, label: position });

    });

  } else if (filters.positionFilter) {

    chips.push({ id: "position", label: filters.positionFilter });

  }



  if (filters.useCandidateFilters) {

    const salaryFiltered =

      filters.salaryMin > filters.salaryBounds.min || filters.salaryMax < filters.salaryBounds.max;

    if (salaryFiltered) {

      chips.push({

        id: "salaryRange",

        label: `${formatSalary(filters.salaryMin)} - ${formatSalary(filters.salaryMax)} RSD`,

      });

    }

  } else {

    if (filters.minSalaryInput?.trim()) {

      chips.push({

        id: "minSalary",

        label: `${Number(filters.minSalaryInput).toLocaleString()}+ RSD`,

      });

    }



    if (filters.maxSalaryInput?.trim()) {

      chips.push({

        id: "maxSalary",

        label: `≤ ${Number(filters.maxSalaryInput).toLocaleString()} RSD`,

      });

    }

  }



  if (isShiftDateFilterActive(filters.shiftDatePreset, filters.shiftDateCustom)) {

    const shiftLabel = filters.shiftDateCustom

      ? filters.shiftDateCustom

      : filters.shiftDatePreset === "today"

        ? t("jobPosts.shiftDateToday")

        : filters.shiftDatePreset === "tomorrow"

          ? t("jobPosts.shiftDateTomorrow")

          : filters.shiftDatePreset === "week"

            ? t("jobPosts.shiftDateThisWeek")

            : t("jobPosts.shiftDateAny");

    chips.push({ id: "shiftDate", label: shiftLabel });

  }



  if (filters.applicationFilter === "applied") {

    chips.push({ id: "applicationFilter", label: t("jobPosts.applied") });

  }



  if (filters.applicationFilter === "notApplied" && !filters.hideAppliedPosts) {

    chips.push({ id: "applicationFilter", label: t("jobPosts.notApplied") });

  }



  if (filters.hideAppliedPosts) {

    chips.push({ id: "hideAppliedPosts", label: t("jobPosts.hideAppliedPosts") });

  }



  const favouritesActive = filters.useCandidateFilters

    ? filters.favouritesOnly

    : filters.favouriteFilter === "favourites";



  if (favouritesActive) {

    chips.push({ id: "favouriteFilter", label: t("jobPosts.favoritesOnly") });

  }



  if (filters.sortBy !== "createdAt" || filters.sortDirection !== "desc") {

    const sortLabel =

      filters.sortBy === "salary" && filters.sortDirection === "desc"

        ? t("jobPosts.salaryHighLow")

        : filters.sortBy === "salary" && filters.sortDirection === "asc"

          ? t("jobPosts.salaryLowHigh")

          : filters.sortDirection === "asc"

            ? t("jobPosts.oldest")

            : t("jobPosts.newest");

    chips.push({ id: "sort", label: sortLabel });

  }



  return chips;

};



export const removeEmployeeActiveFilter = (

  chipId: string,

  handlers: {

    onCityChange: (value: string) => void;

    onRestaurantChange: (value: string) => void;

    onPositionChange: (value: string) => void;

    onPositionToggle?: (position: string) => void;

    onMinSalaryChange: (value: string) => void;

    onMaxSalaryChange: (value: string) => void;

    onSalaryRangeReset?: () => void;

    onShiftDateReset?: () => void;

    onApplicationFilterChange: (value: "all" | "notApplied" | "applied") => void;

    onFavouriteFilterChange: (value: "all" | "favourites") => void;

    onFavouritesOnlyChange?: (value: boolean) => void;

    onHideAppliedPostsChange?: (value: boolean) => void;

    onSortReset: () => void;

  }

) => {

  if (chipId.startsWith("position:")) {

    handlers.onPositionToggle?.(chipId.slice("position:".length));

    return;

  }



  switch (chipId) {

    case "city":

      handlers.onCityChange("");

      break;

    case "restaurant":

      handlers.onRestaurantChange("");

      break;

    case "position":

      handlers.onPositionChange("");

      break;

    case "minSalary":

      handlers.onMinSalaryChange("");

      break;

    case "maxSalary":

      handlers.onMaxSalaryChange("");

      break;

    case "salaryRange":

      handlers.onSalaryRangeReset?.();

      break;

    case "shiftDate":

      handlers.onShiftDateReset?.();

      break;

    case "applicationFilter":

      handlers.onApplicationFilterChange("all");

      break;

    case "hideAppliedPosts":

      handlers.onHideAppliedPostsChange?.(false);

      break;

    case "favouriteFilter":

      handlers.onFavouriteFilterChange("all");

      handlers.onFavouritesOnlyChange?.(false);

      break;

    case "sort":

      handlers.onSortReset();

      break;

    default:

      break;

  }

};

