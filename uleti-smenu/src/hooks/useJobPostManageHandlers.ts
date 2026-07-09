import { useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { JobPost } from "../models/JobPost.model";
import { JobPostManagePanelActions } from "../components/JobPosts/JobPostManagePanel";

type UseJobPostManageHandlersOptions = {
  onPostsChanged: () => void;
  onEdit?: (jobPost: JobPost) => void;
  onViewCandidates?: (jobPost: JobPost) => void;
  onPreview?: (jobPost: JobPost) => void;
};

export const useJobPostManageHandlers = ({
  onPostsChanged,
  onEdit,
  onViewCandidates,
  onPreview,
}: UseJobPostManageHandlersOptions): JobPostManagePanelActions => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:1023px)");

  return {
    onEdit: (jobPost) => {
      if (onEdit) {
        onEdit(jobPost);
        return;
      }

      navigate("/oglasi-za-posao", { state: { openEditForm: true, jobPost } });
    },
    onViewCandidates: (jobPost) => {
      if (onViewCandidates) {
        onViewCandidates(jobPost);
        return;
      }

      if (isMobile) {
        navigate(`/oglasi-za-posao/${jobPost.id}`, { state: { jobPost } });
        return;
      }

      navigate("/oglasi-za-posao", {
        state: { openCandidatesPanel: true, jobPost },
      });
    },
    onPreview: (jobPost) => {
      if (onPreview) {
        onPreview(jobPost);
        return;
      }

      if (isMobile) {
        navigate(`/oglasi-za-posao/${jobPost.id}`, {
          state: { jobPost, previewMode: true },
        });
        return;
      }

      navigate("/oglasi-za-posao", { state: { openPreview: true, jobPost } });
    },
    onPostsChanged,
  };
};
