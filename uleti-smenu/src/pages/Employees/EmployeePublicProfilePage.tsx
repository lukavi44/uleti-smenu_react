import { useContext, useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useMediaQuery } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CandidateDetailHeader from "../../components/Candidate/CandidateDetailHeader";
import { EmployeePublicProfile } from "../../models/WorkExperience.model";
import { GetEmployeePublicProfile } from "../../services/employee-profile-service";
import { AuthContext } from "../../store/Auth-context";
import EmployeePublicProfileSections from "./EmployeePublicProfileSections";
import styles from "./EmployeePublicProfilePage.module.scss";

const EmployeePublicProfilePage = () => {
  const { t } = useTranslation();
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:1023px)");
  const { authStatus, role } = useContext(AuthContext);
  const [profile, setProfile] = useState<EmployeePublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!employeeId) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await GetEmployeePublicProfile(employeeId);
        setProfile(response.data);
        setLoadError(false);
      } catch {
        setProfile(null);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (authStatus === "authenticated" && role === "Employer") {
      void loadProfile();
    }
  }, [authStatus, role, employeeId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/oglasi-za-posao");
  };

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated" || role !== "Employer") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  return (
    <main className={styles.page}>
      <button type="button" className={styles.backButton} onClick={handleBack}>
        <ArrowLeftIcon className={styles.backIcon} aria-hidden="true" />
        {isMobile ? t("employeeProfile.back") : t("employeeProfile.backToCandidates")}
      </button>

      {isLoading && <p className={styles.mutedText}>{t("common.loading")}</p>}
      {loadError && !isLoading && <p className={styles.mutedText}>{t("employeeProfile.loadError")}</p>}

      {!isLoading && !loadError && profile && employeeId && (
        <>
          <CandidateDetailHeader profile={profile} />
          <EmployeePublicProfileSections employeeId={employeeId} profile={profile} />
        </>
      )}
    </main>
  );
};

export default EmployeePublicProfilePage;
