import { JobPost } from "../models/JobPost.model";

export const formatShiftDateTime = (value: Date | string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatShiftDateTimeLabel = (value: Date | string, locale?: string): string => {
  const parsed = formatShiftDateTime(value);
  if (!parsed) {
    return "-";
  }

  return parsed.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getJobPostLocationLabel = (post: JobPost): string => {
  if (post.restaurantLocationName && post.restaurantLocationCity) {
    return `${post.restaurantLocationName} (${post.restaurantLocationCity})`;
  }

  if (post.restaurantLocationName) {
    return post.restaurantLocationName;
  }

  if (post.restaurantLocationCity) {
    return post.restaurantLocationCity;
  }

  return "-";
};

export const formatJobPostSalary = (salary: number): string => {
  if (!Number.isFinite(salary)) {
    return "-";
  }

  return `${salary.toLocaleString()} RSD`;
};
