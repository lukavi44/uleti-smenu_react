import { useTranslation } from "react-i18next";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import ImageWithFallback from "../Common/ImageWithFallback";
import { JobPost } from "../../models/JobPost.model";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { getEmployerJobPostStatusBadge } from "../../helpers/employerJobPostMobile";
import ChatContactAvatar from "../Chat/ChatContactAvatar";
import styles from "./EmployerJobPostMobileCard.module.scss";

type EmployerJobPostMobileCardProps = {
  jobPost: JobPost;
  onOpen: (jobPost: JobPost) => void;
};

const EmployerJobPostMobileCard = ({ jobPost, onOpen }: EmployerJobPostMobileCardProps) => {
  const { t } = useTranslation();
  const statusBadge = getEmployerJobPostStatusBadge(jobPost, t);
  const applicantCount = jobPost.applicantCount ?? 0;
  const recentApplicants = jobPost.recentApplicants ?? [];
  const visibleAvatars = recentApplicants.slice(0, 3);
  const overflowCount = Math.max(0, applicantCount - visibleAvatars.length);
  const locationLabel = jobPost.restaurantLocationCity || jobPost.restaurantLocationName || "-";

  return (
    <button type="button" className={styles.card} onClick={() => onOpen(jobPost)}>
      <ImageWithFallback
        src={jobPost.employer?.profilePhoto}
        alt=""
        className={styles.logo}
        fallbackClassName={styles.logoFallback}
      />

      <div className={styles.body}>
        <div className={styles.topRow}>
          <h3 className={styles.title}>{jobPost.title}</h3>
          <span className={`${styles.statusBadge} ${styles[`statusBadge${statusBadge.variant}`]}`}>
            {statusBadge.label}
          </span>
        </div>

        <div className={styles.metaRow}>
          <MapPinIcon className={styles.metaIcon} aria-hidden />
          <span>{locationLabel}</span>
        </div>

        <div className={styles.metaRow}>
          <CalendarDaysIcon className={styles.metaIcon} aria-hidden />
          <span>{formatDisplayDate(String(jobPost.startingDate))}</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.applicantsBlock}>
            <strong className={styles.applicantCount}>
              {t("jobPosts.applicationsCount", { count: applicantCount })}
            </strong>
            {applicantCount > 0 && (
              <div className={styles.avatarStack}>
                {visibleAvatars.map((applicant) => (
                  <span key={applicant.userId} className={styles.avatarWrap}>
                    <ChatContactAvatar
                      name={`${applicant.firstName} ${applicant.lastName}`}
                      profilePhoto={applicant.profilePhoto}
                      size="sm"
                    />
                  </span>
                ))}
                {overflowCount > 0 && (
                  <span className={styles.overflowBadge}>+{overflowCount}</span>
                )}
              </div>
            )}
          </div>
          <ChevronRightIcon className={styles.chevron} aria-hidden />
        </div>
      </div>
    </button>
  );
};

export default EmployerJobPostMobileCard;
