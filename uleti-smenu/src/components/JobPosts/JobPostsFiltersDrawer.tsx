import { useEffect } from "react";

import { XMarkIcon } from "@heroicons/react/24/outline";

import { useTranslation } from "react-i18next";

import JobPostsEmployeeFiltersPanel, {

  JobPostsEmployeeFiltersPanelProps,

} from "./JobPostsEmployeeFiltersPanel";

import styles from "./JobPostsFiltersDrawer.module.scss";



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



  useEffect(() => {

    if (!isOpen) {

      return;

    }



    const onKeyDown = (event: KeyboardEvent) => {

      if (event.key === "Escape") {

        onClose();

      }

    };



    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);



    return () => {

      document.body.style.overflow = "";

      window.removeEventListener("keydown", onKeyDown);

    };

  }, [isOpen, onClose]);



  if (!isOpen) {

    return null;

  }



  return (

    <div className={styles.root}>

      <button

        type="button"

        className={styles.backdrop}

        aria-label={t("common.close")}

        onClick={onClose}

      />

      <aside className={styles.panel} role="dialog" aria-modal="true" aria-label={t("jobPosts.filters")}>

        <div className={styles.panelHeader}>

          <h2 className={styles.panelTitle}>{t("jobPosts.filters")}</h2>

          <button type="button" className={styles.closeButton} onClick={onClose} aria-label={t("common.close")}>

            <XMarkIcon />

          </button>

        </div>



        <div className={styles.panelBody}>

          <JobPostsEmployeeFiltersPanel {...filtersPanelProps} />

        </div>



        <div className={styles.panelFooter}>

          <button type="button" className={styles.resetButton} onClick={onReset}>

            {t("jobPosts.resetAllFilters")}

          </button>

          <button type="button" className={styles.applyButton} onClick={onClose}>

            {t("jobPosts.showResults", { count: totalCount })}

          </button>

        </div>

      </aside>

    </div>

  );

};



export default JobPostsFiltersDrawer;

