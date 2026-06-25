import { TFunction } from "i18next";

export const getApplicationStatusLabel = (status: string, t: TFunction): string => {
  switch (status) {
    case "Applied":
      return t("profile.applicationStatus.applied");
    case "Accepted":
      return t("profile.applicationStatus.accepted");
    case "Denied":
      return t("profile.applicationStatus.denied");
    case "Cancelled":
      return t("profile.applicationStatus.cancelled");
    case "Expired":
      return t("profile.applicationStatus.expired");
    default:
      return status;
  }
};

export const canEmployerDecideOnApplication = (status: string): boolean => status === "Applied";
