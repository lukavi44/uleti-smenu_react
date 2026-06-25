import { useState } from "react";
import {
  BanknotesIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { JobPost } from "../../models/JobPost.model";
import { ApplyToJobPost } from "../../services/application-service";
import {
  formatJobPostSalary,
  formatShiftDateTimeLabel,
  getJobPostLocationLabel,
} from "../../helpers/jobPostDisplay";
import styles from "./RecommendedJobPostCard.module.scss";

type RecommendedJobPostCardProps = {
  jobPost: JobPost;
  hasApplied: boolean;
  onApplied: (jobPostId: string) => void;
};

const RecommendedJobPostCard = ({
  jobPost,
  hasApplied,
  onApplied,
}: RecommendedJobPostCardProps) => {
  const { t, i18n } = useTranslation();
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (hasApplied || isApplying) {
      return;
    }

    setIsApplying(true);
    try {
      await ApplyToJobPost(jobPost.id);
      toast.success(t("jobPosts.applySuccess"));
      onApplied(jobPost.id);
    } catch {
      toast.error(t("jobPosts.applyError"));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.badge}>{jobPost.position}</span>
      </div>

      <h3 className={styles.cardTitle}>{jobPost.title}</h3>
      <p className={styles.employerName}>{jobPost.employer?.name ?? t("common.notAvailable")}</p>

      <ul className={styles.metaList}>
        <li className={styles.metaItem}>
          <MapPinIcon className={styles.metaIcon} aria-hidden="true" />
          <span>{getJobPostLocationLabel(jobPost)}</span>
        </li>
        <li className={styles.metaItem}>
          <ClockIcon className={styles.metaIcon} aria-hidden="true" />
          <span>{formatShiftDateTimeLabel(jobPost.startingDate, i18n.language)}</span>
        </li>
        <li className={styles.metaItem}>
          <BanknotesIcon className={styles.metaIcon} aria-hidden="true" />
          <span>{formatJobPostSalary(jobPost.salary)}</span>
        </li>
      </ul>

      <button
        type="button"
        className={styles.applyButton}
        onClick={() => void handleApply()}
        disabled={hasApplied || isApplying}
      >
        {isApplying
          ? t("jobPosts.applying")
          : hasApplied
            ? t("jobPosts.appliedShort")
            : t("jobPosts.apply")}
      </button>
    </article>
  );
};

export default RecommendedJobPostCard;
