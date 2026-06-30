import {
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  HandThumbUpIcon,
  MapPinIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { formatExperienceYears } from "../../helpers/formatExperienceYears";
import { EmployeePublicProfile } from "../../models/WorkExperience.model";
import styles from "./CandidateDetailHeader.module.scss";

interface CandidateDetailHeaderProps {
  profile: EmployeePublicProfile;
}

const formatMemberSince = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString();
};

const formatLocation = (city?: string, country?: string) => {
  const parts = [city?.trim(), country?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
};

const CandidateDetailHeader = ({ profile }: CandidateDetailHeaderProps) => {
  const { t } = useTranslation();
  const locationLabel = formatLocation(profile.city, profile.country);
  const memberSinceLabel = formatMemberSince(profile.memberSinceUtc);
  const experienceLabel = formatExperienceYears(profile.totalExperienceYears, t);
  const ratingLabel =
    profile.reviewSummary.reviewCount > 0
      ? `${profile.reviewSummary.averageRating.toFixed(1)} (${profile.reviewSummary.reviewCount})`
      : t("employeeProfile.experienceUnavailable");
  const ageLabel =
    profile.age != null ? String(profile.age) : t("employeeProfile.experienceUnavailable");

  return (
    <section className={styles.card}>
      <div className={styles.profileRow}>
        <div className={styles.photoWrap}>
          <img
            src={getImageUrl(profile.profilePhoto)}
            alt={`${profile.firstName} ${profile.lastName}`}
            className={styles.photo}
          />
          <span className={styles.onlineDot} aria-hidden="true" />
        </div>

        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>
              {profile.firstName} {profile.lastName}
            </h1>
            <CheckBadgeIcon className={styles.verifiedIcon} aria-hidden="true" />
          </div>

          {profile.reviewSummary.reviewCount > 0 && (
            <p className={styles.ratingLine}>
              <StarIcon className={styles.ratingIcon} aria-hidden="true" />
              {profile.reviewSummary.averageRating.toFixed(1)} ({profile.reviewSummary.reviewCount})
            </p>
          )}

          {locationLabel && (
            <p className={styles.metaLine}>
              <MapPinIcon className={styles.metaIcon} aria-hidden="true" />
              {locationLabel}
            </p>
          )}

          {memberSinceLabel && (
            <p className={styles.metaLine}>
              <CalendarDaysIcon className={styles.metaIcon} aria-hidden="true" />
              {t("employeeProfile.memberSince", { date: memberSinceLabel })}
            </p>
          )}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <CalendarDaysIcon className={`${styles.statIcon} ${styles.statIconBlue}`} aria-hidden="true" />
          <strong className={styles.statValue}>{ageLabel}</strong>
          <span className={styles.statLabel}>{t("employeeProfile.statAge")}</span>
        </article>

        <article className={styles.statCard}>
          <StarIcon className={`${styles.statIcon} ${styles.statIconOrange}`} aria-hidden="true" />
          <strong className={styles.statValue}>{experienceLabel}</strong>
          <span className={styles.statLabel}>{t("employeeProfile.statExperience")}</span>
        </article>

        <article className={styles.statCard}>
          <HandThumbUpIcon className={`${styles.statIcon} ${styles.statIconGreen}`} aria-hidden="true" />
          <strong className={styles.statValue}>{ratingLabel}</strong>
          <span className={styles.statLabel}>{t("employeeProfile.statAverageRating")}</span>
        </article>

        <article className={styles.statCard}>
          <BriefcaseIcon className={`${styles.statIcon} ${styles.statIconBlue}`} aria-hidden="true" />
          <strong className={styles.statValue}>{profile.platformShiftCount}</strong>
          <span className={styles.statLabel}>{t("employeeProfile.statAcceptedShifts")}</span>
        </article>
      </div>
    </section>
  );
};

export default CandidateDetailHeader;
