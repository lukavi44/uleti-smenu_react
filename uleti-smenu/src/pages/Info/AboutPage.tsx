import { useTranslation } from "react-i18next";
import InfoPageLayout from "./InfoPageLayout";
import styles from "./InfoPageLayout.module.scss";

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <InfoPageLayout title={t("info.about.title")} intro={t("info.about.intro")}>
      <section className={styles.section}>
        <h2>{t("info.about.missionTitle")}</h2>
        <p>{t("info.about.missionText")}</p>
      </section>
      <section className={styles.section}>
        <h2>{t("info.about.whoTitle")}</h2>
        <p>{t("info.about.whoText")}</p>
      </section>
      <section className={styles.section}>
        <h2>{t("info.about.expectTitle")}</h2>
        <ul className={styles.bulletList}>
          <li>{t("info.about.expectItem1")}</li>
          <li>{t("info.about.expectItem2")}</li>
          <li>{t("info.about.expectItem3")}</li>
        </ul>
      </section>
    </InfoPageLayout>
  );
};

export default AboutPage;
