import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import { Employer } from "../../models/User.model";
import styles from "./EmployerDashboardMobileGreeting.module.scss";

const getGreetingKey = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "employerShell.greetingMorning";
  if (hour < 18) return "employerShell.greetingAfternoon";
  return "employerShell.greetingEvening";
};

const EmployerDashboardMobileGreeting = () => {
  const { t } = useTranslation();
  const { me } = useContext(AuthContext);
  const employer = me && "name" in me ? (me as Employer) : null;
  const displayName = employer?.name?.trim() || t("employerShell.defaultName");

  return (
    <div className={styles.greetingBlock}>
      <h1 className={styles.greeting}>{t(getGreetingKey(), { name: displayName })}</h1>
      <p className={styles.subtext}>{t("employerShell.greetingSubtext")}</p>
    </div>
  );
};

export default EmployerDashboardMobileGreeting;
