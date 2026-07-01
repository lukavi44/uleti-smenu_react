import { formatDisplayDate } from "./formatDisplayDate";

export const formatReviewDateTime = (value?: string, compact = false): string => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const dateLabel = formatDisplayDate(value);
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  if (compact) {
    return `${dateLabel} ${hours}:${minutes}`;
  }

  return `${dateLabel}. u ${hours}:${minutes}`;
};
