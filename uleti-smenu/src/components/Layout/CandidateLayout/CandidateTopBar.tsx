import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../store/Auth-context";
import { Employee } from "../../../models/User.model";
import CandidateTopActions from "./CandidateTopActions";
import styles from "./CandidateTopBar.module.scss";

const getGreetingKey = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "candidate.greetingMorning";
  if (hour < 18) return "candidate.greetingAfternoon";
  return "candidate.greetingEvening";
};

const CandidateTopBar = () => {
  const { t } = useTranslation();
  const { me } = useContext(AuthContext);
  const employee = me && "firstName" in me ? (me as Employee) : null;
  const displayName = employee?.firstName?.trim() || t("candidate.defaultName");

  return (
    <header className={styles.topBar}>
      <div>
        <h1 className={styles.greeting}>{t(getGreetingKey(), { name: displayName })}</h1>
      </div>
      <CandidateTopActions />
    </header>
  );
};

export default CandidateTopBar;
