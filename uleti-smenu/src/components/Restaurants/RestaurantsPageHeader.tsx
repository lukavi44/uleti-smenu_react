import { useContext } from "react";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import { useIsEmployerShell } from "../../hooks/useIsEmployerShell";
import CandidateTopActions from "../Layout/CandidateLayout/CandidateTopActions";
import EmployerTopActions from "../Layout/EmployerLayout/EmployerTopActions";
import styles from "./RestaurantsPageHeader.module.scss";

const RestaurantsPageHeader = () => {
  const { t } = useTranslation();
  const { authStatus } = useContext(AuthContext);
  const isEmployerShell = useIsEmployerShell();
  const isMobile = useMediaQuery("(max-width:1023px)");
  const showCandidateActions = authStatus === "authenticated" && !isEmployerShell;
  const showEmployerDesktopActions = authStatus === "authenticated" && isEmployerShell && !isMobile;

  return (
    <div className={styles.header}>
      <div className={styles.headlineRow}>
        <h1 className={styles.title}>{t("candidate.restaurantsTitle")}</h1>
        {showCandidateActions ? <CandidateTopActions /> : null}
        {showEmployerDesktopActions ? <EmployerTopActions /> : null}
      </div>      <p className={styles.subtitle}>{t("candidate.restaurantsSubtitle")}</p>
    </div>
  );
};

export default RestaurantsPageHeader;
