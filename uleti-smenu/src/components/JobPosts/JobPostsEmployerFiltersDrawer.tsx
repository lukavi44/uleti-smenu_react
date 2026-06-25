import { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import JobPostsFiltersBar from "./JobPostsFiltersBar";
import JobPostsSideDrawer from "./JobPostsSideDrawer";
import styles from "./JobPostsSideDrawer.module.scss";

type JobPostsEmployerFiltersDrawerProps = {
  isOpen: boolean;
  totalCount: number;
  onClose: () => void;
  onReset: () => void;
  filtersBarProps: ComponentProps<typeof JobPostsFiltersBar>;
};

const JobPostsEmployerFiltersDrawer = ({
  isOpen,
  totalCount,
  onClose,
  onReset,
  filtersBarProps,
}: JobPostsEmployerFiltersDrawerProps) => {
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
      <JobPostsFiltersBar {...filtersBarProps} layout="panel" />
    </JobPostsSideDrawer>
  );
};

export default JobPostsEmployerFiltersDrawer;
