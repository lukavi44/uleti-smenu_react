import { useTranslation } from "react-i18next";
import styles from "./AdminSettingsPage.module.scss";

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

  const healthUrl = apiBase ? `${apiBase}/health` : null;
  const readyUrl = apiBase ? `${apiBase}/health/ready` : null;

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h2 className={styles.title}>{t("admin.settings.title")}</h2>
        <p className={styles.text}>{t("admin.settings.description")}</p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.title}>{t("admin.settings.opsTitle")}</h2>
        <p className={styles.text}>{t("admin.settings.opsIntro")}</p>
        <ul className={styles.list}>
          <li>{t("admin.settings.opsVerifyEmployer")}</li>
          <li>{t("admin.settings.opsBilling")}</li>
          <li>{t("admin.settings.opsModeration")}</li>
          <li>{t("admin.settings.opsSupport")}</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.title}>{t("admin.settings.monitoringTitle")}</h2>
        <p className={styles.text}>{t("admin.settings.monitoringIntro")}</p>
        <dl className={styles.endpointList}>
          <div className={styles.endpointRow}>
            <dt>{t("admin.settings.healthLiveness")}</dt>
            <dd>
              {healthUrl ? (
                <a href={healthUrl} target="_blank" rel="noreferrer" className={styles.link}>
                  {healthUrl}
                </a>
              ) : (
                <code>/health</code>
              )}
            </dd>
          </div>
          <div className={styles.endpointRow}>
            <dt>{t("admin.settings.healthReadiness")}</dt>
            <dd>
              {readyUrl ? (
                <a href={readyUrl} target="_blank" rel="noreferrer" className={styles.link}>
                  {readyUrl}
                </a>
              ) : (
                <code>/health/ready</code>
              )}
            </dd>
          </div>
        </dl>
        <p className={styles.hint}>{t("admin.settings.monitoringHint")}</p>
      </section>
    </div>
  );
};

export default AdminSettingsPage;
