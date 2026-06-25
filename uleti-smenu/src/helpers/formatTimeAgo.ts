import { TFunction } from "i18next";

export const formatTimeAgo = (date: Date | string, t: TFunction): string => {
  const value = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - value.getTime();

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return t("common.notAvailable");
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return t("timeAgo.justNow");
  }
  if (minutes < 60) {
    return t("timeAgo.minutes", { count: minutes });
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t("timeAgo.hours", { count: hours });
  }

  const days = Math.floor(hours / 24);
  return t("timeAgo.days", { count: days });
};
