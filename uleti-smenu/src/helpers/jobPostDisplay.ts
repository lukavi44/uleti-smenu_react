import { JobPost } from "../models/JobPost.model";
import { formatDisplayDateTime } from "./formatDisplayDateTime";

export const formatShiftDateTime = (value: Date | string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatShiftDateTimeLabel = (value: Date | string): string => {
  const parsed = formatShiftDateTime(value);
  if (!parsed) {
    return "-";
  }

  return formatDisplayDateTime(parsed);
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
