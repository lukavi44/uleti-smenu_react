import { useState } from "react";
import { useTranslation } from "react-i18next";
import { JobPost } from "../../models/JobPost.model";
import JobPostForm from "./JobPostForm";
import JobPostsSideDrawer from "./JobPostsSideDrawer";
import styles from "./JobPostsSideDrawer.module.scss";

const EMPLOYER_JOB_POST_FORM_ID = "employer-job-post-form";

type JobPostsEmployerFormDrawerProps = {
  isOpen: boolean;
  editingJobPost?: JobPost;
  onClose: () => void;
  onSubmit: () => void;
};

const JobPostsEmployerFormDrawer = ({
  isOpen,
  editingJobPost,
  onClose,
  onSubmit,
}: JobPostsEmployerFormDrawerProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(editingJobPost?.id);

  return (
    <JobPostsSideDrawer
      isOpen={isOpen}
      variant="form"
      title={isEditMode ? t("jobPostForm.editTitle") : t("jobPostForm.createTitle")}
      subtitle={isEditMode ? t("jobPostForm.editSubtitle") : t("jobPostForm.createSubtitle")}
      onClose={onClose}
      flushBody
      footer={
        <>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            form={EMPLOYER_JOB_POST_FORM_ID}
            className={styles.applyButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("common.loading")
              : isEditMode
                ? t("jobPostForm.saveChanges")
                : t("jobPostForm.createAd")}
          </button>
        </>
      }
    >
      <JobPostForm
        key={editingJobPost?.id ?? "create"}
        formId={EMPLOYER_JOB_POST_FORM_ID}
        initialData={editingJobPost}
        onClose={onClose}
        onSubmit={onSubmit}
        onSubmittingChange={setIsSubmitting}
        embeddedInDrawer
      />
    </JobPostsSideDrawer>
  );
};

export default JobPostsEmployerFormDrawer;
