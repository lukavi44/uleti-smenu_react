import { useContext } from "react";
import { AuthContext } from "../../store/Auth-context";
import EmployerProfile from "./EmployerProfile";
import { Employee, Employer } from "../../models/User.model";
import EmployeeProfile from "./EmployeeProfile";
import { useTranslation } from "react-i18next";
import CandidatePageHeader from "../../components/Candidate/CandidatePageHeader";
import { useIsCandidateShell } from "../../hooks/useIsCandidateShell";
import { useIsEmployerShell } from "../../hooks/useIsEmployerShell";
import styles from "./ProfilePageHeader.module.scss";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { role, me, authStatus } = useContext(AuthContext);
  const isCandidateShell = useIsCandidateShell();
  const isEmployerShell = useIsEmployerShell();

  if (authStatus === "loading") return <div>{t("profile.loadingProfile")}</div>;
  if (authStatus === "unauthenticated") return <div>{t("common.unauthorized")}</div>;
  if (!me) return <div>{t("profile.loadingProfile")}</div>;

  switch (role) {
    case "Employer":
      return (
        <>
          {isEmployerShell ? (
            <div className={styles.employerDesktopHeader}>
              <CandidatePageHeader
                title={t("employerShell.profileTitle")}
                subtitle={t("employerShell.profileSubtitle")}
              />
            </div>
          ) : null}
          <EmployerProfile user={me as Employer} />
        </>
      );
    case "Employee":
      return (
        <>
          {isCandidateShell ? (
            <CandidatePageHeader
              title={t("candidate.profileTitle")}
              subtitle={t("candidate.profileSubtitle")}
            />
          ) : null}
          <EmployeeProfile user={me as Employee} />
        </>
      );
    default:
      return <div>{t("common.unknownRole")}</div>;
  }
};

export default ProfilePage;
