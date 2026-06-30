import { TFunction } from "i18next";

export function formatExperienceYears(
  years: number | null | undefined,
  t: TFunction
): string {
  if (years == null || years < 1 / 12) {
    return t("employeeProfile.experienceUnavailable");
  }

  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return t("employeeProfile.experienceMonths", { count: months });
  }

  const wholeYears = Math.floor(years);
  if (wholeYears >= 2) {
    return t("employeeProfile.experienceYearsPlus", { years: wholeYears });
  }

  return t("employeeProfile.experienceOneYear");
}
