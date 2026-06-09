import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import InfoPageLayout from "./InfoPageLayout";
import styles from "./InfoPageLayout.module.scss";

const TIP_ITEMS = [1, 2, 3, 4] as const;

const ForCandidatesPage = () => {
  const { t } = useTranslation();

  return (
    <InfoPageLayout title={t("info.forCandidates.title")} intro={t("info.forCandidates.intro")}>
      <section className={styles.section}>
        <h2>{t("info.forCandidates.findShiftTitle")}</h2>
        <p>{t("info.forCandidates.findShiftText")}</p>
      </section>

      <section className={styles.section}>
        <h2>{t("info.forCandidates.applyTitle")}</h2>
        <p>{t("info.forCandidates.applyText")}</p>
      </section>

      <section className={styles.section}>
        <h2>{t("info.forCandidates.tipsTitle")}</h2>
        <ul className={styles.bulletList}>
          {TIP_ITEMS.map((item) => (
            <li key={item}>{t(`info.forCandidates.tip${item}`)}</li>
          ))}
        </ul>
      </section>

      <div className={styles.ctaRow}>
        <Link className={styles.ctaPrimary} to="/registration-user">
          {t("info.forCandidates.ctaRegister")}
        </Link>
        <Link className={styles.ctaSecondary} to="/how-it-works#candidates">
          {t("info.forCandidates.ctaHowItWorks")}
        </Link>
        <Link className={styles.ctaSecondary} to="/login">
          {t("header.login")}
        </Link>
      </div>
    </InfoPageLayout>
  );
};

export default ForCandidatesPage;
