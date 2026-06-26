import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { JobPost } from "../../models/JobPost.model";
import EmployerJobPostCandidatesList from "./EmployerJobPostCandidatesList";
import styles from "./EmployerJobPostCandidatesSidePanel.module.scss";

type EmployerJobPostCandidatesSidePanelProps = {
  jobPost: JobPost;
  onClose: () => void;
};

const EmployerJobPostCandidatesSidePanel = ({
  jobPost,
  onClose,
}: EmployerJobPostCandidatesSidePanelProps) => {
  const { t } = useTranslation();
  const applicantCount = jobPost.applicantCount ?? 0;

  return (
    <aside className={styles.panel} aria-label={t("applicants.panelTitle")}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2>{t("applicants.panelTitle")}</h2>
          <p className={styles.subtitle}>{jobPost.title}</p>
          <p className={styles.count}>
            {t("jobPosts.applicationsCount", { count: applicantCount })}
          </p>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={t("common.close")}
        >
          <XMarkIcon className={styles.closeIcon} aria-hidden />
        </button>
      </div>

      <div className={styles.body}>
        <EmployerJobPostCandidatesList jobPostId={jobPost.id} variant="desktopPanel" />
      </div>
    </aside>
  );
};

export default EmployerJobPostCandidatesSidePanel;
