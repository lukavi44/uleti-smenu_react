import { useTranslation } from "react-i18next";
import styles from "./AdminPlaceholderPage.module.scss";

const AdminReportsPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <p className={styles.message}>{t("admin.reports.empty")}</p>
    </div>
  );
};

export default AdminReportsPage;
