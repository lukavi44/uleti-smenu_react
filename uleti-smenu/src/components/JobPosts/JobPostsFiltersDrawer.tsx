import { useTranslation } from "react-i18next";
import JobPostsEmployeeFiltersPanel, {
  JobPostsEmployeeFiltersPanelProps,
} from "./JobPostsEmployeeFiltersPanel";
import JobPostsSideDrawer from "./JobPostsSideDrawer";
import styles from "./JobPostsSideDrawer.module.scss";

type JobPostsFiltersDrawerProps = {
  isOpen: boolean;
  totalCount: number;
  onClose: () => void;
  onReset: () => void;
  filtersPanelProps: JobPostsEmployeeFiltersPanelProps;
};

const JobPostsFiltersDrawer = ({
  isOpen,
  totalCount,
  onClose,
  onReset,
  filtersPanelProps,
}: JobPostsFiltersDrawerProps) => {
  const { t } = useTranslation();

  return (
    <JobPostsSideDrawer
      isOpen={isOpen}
      title={t("jobPosts.filters")}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={styles.resetButton} onClick={onReset}>
            {t("jobPosts.resetAllFilters")}
          </button>
          <button type="button" className={styles.applyButton} onClick={onClose}>
            {t("jobPosts.showResults", { count: totalCount })}
          </button>
        </>
      }
    >
      <JobPostsEmployeeFiltersPanel {...filtersPanelProps} />
    </JobPostsSideDrawer>
  );
};

export default JobPostsFiltersDrawer;
