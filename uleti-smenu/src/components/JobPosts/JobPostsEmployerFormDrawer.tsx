import { useTranslation } from "react-i18next";
import { JobPost } from "../../models/JobPost.model";
import JobPostForm from "./JobPostForm";
import JobPostsSideDrawer from "./JobPostsSideDrawer";

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
  const isEditMode = Boolean(editingJobPost?.id);

  return (
    <JobPostsSideDrawer
      isOpen={isOpen}
      title={isEditMode ? t("jobPostForm.editTitle") : t("jobPostForm.createTitle")}
      onClose={onClose}
      wide
      flushBody
    >
      <JobPostForm
        key={editingJobPost?.id ?? "create"}
        initialData={editingJobPost}
        onClose={onClose}
        onSubmit={onSubmit}
        embeddedInDrawer
      />
    </JobPostsSideDrawer>
  );
};

export default JobPostsEmployerFormDrawer;
