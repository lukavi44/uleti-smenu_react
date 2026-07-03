import { FunnelIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import CandidateTopActions from "../Layout/CandidateLayout/CandidateTopActions";
import styles from "./JobPostsEmployeeHeader.module.scss";

type JobPostsEmployeeHeaderProps = {
  onOpenFilters: () => void;
  activeFilterCount: number;
  showTopActions?: boolean;
};

const JobPostsEmployeeHeader = ({
  onOpenFilters,
  activeFilterCount,
  showTopActions = true,
}: JobPostsEmployeeHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <div className={styles.headlineRow}>
        <h1 className={styles.title}>{t("candidate.jobPostsTitle")}</h1>
        {showTopActions ? <CandidateTopActions /> : null}
      </div>

      <p className={styles.subtitle}>{t("candidate.jobPostsSubtitle")}</p>

      <div className={styles.filterRow}>
        <button type="button" className={styles.filterButton} onClick={onOpenFilters}>
          <FunnelIcon className={styles.filterIcon} aria-hidden="true" />
          <span>{t("jobPosts.filters")}</span>
          {activeFilterCount > 0 ? (
            <span className={styles.filterBadge}>{activeFilterCount}</span>
          ) : null}
        </button>
      </div>
    </div>
  );
};

export default JobPostsEmployeeHeader;
