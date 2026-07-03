import { TFunction } from "i18next";

export const getRatingQualityLabel = (
  averageRating: number,
  reviewCount: number,
  t: TFunction
): string | null => {
  if (reviewCount <= 0) {
    return null;
  }
  if (averageRating >= 4.5) {
    return t("profile.employerManage.ratingExcellent");
  }
  if (averageRating >= 4) {
    return t("profile.employerManage.ratingVeryGood");
  }
  if (averageRating >= 3) {
    return t("profile.employerManage.ratingGood");
  }
  return null;
};
