import { PlusIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import EmployerTopActions from "../Layout/EmployerLayout/EmployerTopActions";
import styles from "./JobPostsEmployerHeader.module.scss";

type JobPostsEmployerHeaderProps = {
  onOpenFilters: () => void;
  onCreatePost: () => void;
  activeFilterCount: number;
};

const JobPostsEmployerHeader = ({
  onOpenFilters,
  onCreatePost,
  activeFilterCount,
}: JobPostsEmployerHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <div className={styles.headlineRow}>
        <h1 className={styles.title}>{t("employerShell.jobPostsTitle")}</h1>
        <EmployerTopActions />
      </div>

      <p className={styles.subtitle}>{t("employerShell.jobPostsSubtitle")}</p>

      <div className={styles.actionRow}>
        <button type="button" className={styles.filterButton} onClick={onOpenFilters}>
          <FunnelIcon className={styles.actionIcon} aria-hidden="true" />
          <span>{t("jobPosts.filters")}</span>
          {activeFilterCount > 0 ? (
            <span className={styles.filterBadge}>{activeFilterCount}</span>
          ) : null}
        </button>
        <button type="button" className={styles.createButton} onClick={onCreatePost}>
          <PlusIcon className={styles.actionIcon} aria-hidden="true" />
          <span>{t("jobPosts.createPost")}</span>
        </button>
      </div>
    </div>
  );
};

export default JobPostsEmployerHeader;
