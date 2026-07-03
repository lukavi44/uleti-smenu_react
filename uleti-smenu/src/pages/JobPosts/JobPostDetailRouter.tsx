import { useContext } from "react";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import EmployerJobPostDetailPage from "./EmployerJobPostDetailPage";
import JobPostPublicDetailPage from "./JobPostPublicDetailPage";
import styles from "./JobPostPublicDetailPage.module.scss";

const JobPostDetailRouter = () => {
  const { t } = useTranslation();
  const { authStatus, role } = useContext(AuthContext);
  const isMobile = useMediaQuery("(max-width:1023px)");

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "authenticated" && role === "Employer" && isMobile) {
    return <EmployerJobPostDetailPage />;
  }

  return <JobPostPublicDetailPage />;
};

export default JobPostDetailRouter;
