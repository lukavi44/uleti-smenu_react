import { useTranslation } from "react-i18next";
import styles from "./AdminSettingsPage.module.scss";

const AdminSettingsPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h2 className={styles.title}>{t("admin.settings.title")}</h2>
        <p className={styles.text}>{t("admin.settings.description")}</p>
      </section>
    </div>
  );
};

export default AdminSettingsPage;
