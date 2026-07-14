import { formatDisplayDate } from "./formatDisplayDate";

export const formatDisplayDateTime = (value?: string | Date): string => {
  if (!value) {
    return "";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${formatDisplayDate(parsed)} ${hours}:${minutes}`;
};
