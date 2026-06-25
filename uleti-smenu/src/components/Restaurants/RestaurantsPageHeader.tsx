import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import CandidateTopActions from "../Layout/CandidateLayout/CandidateTopActions";
import styles from "./RestaurantsPageHeader.module.scss";

const RestaurantsPageHeader = () => {
  const { t } = useTranslation();
  const { authStatus } = useContext(AuthContext);
  const showTopActions = authStatus === "authenticated";

  return (
    <div className={styles.header}>
      <div className={styles.headlineRow}>
        <h1 className={styles.title}>{t("candidate.restaurantsTitle")}</h1>
        {showTopActions ? <CandidateTopActions /> : null}
      </div>
      <p className={styles.subtitle}>{t("candidate.restaurantsSubtitle")}</p>
    </div>
  );
};

export default RestaurantsPageHeader;
