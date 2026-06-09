import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import InfoPageLayout from "./InfoPageLayout";
import styles from "./InfoPageLayout.module.scss";

const ForEmployersPage = () => {
  const { t } = useTranslation();

  return (
    <InfoPageLayout title={t("info.forEmployers.title")} intro={t("info.forEmployers.intro")}>
      <section className={styles.section}>
        <h2>{t("info.forEmployers.postTitle")}</h2>
        <p>{t("info.forEmployers.postText")}</p>
      </section>

      <section className={styles.section}>
        <h2>{t("info.forEmployers.candidatesTitle")}</h2>
        <p>{t("info.forEmployers.candidatesText")}</p>
      </section>

      <section className={styles.section} id="pricing">
        <h2>{t("info.forEmployers.pricingTitle")}</h2>
        <p>{t("info.forEmployers.pricingText")}</p>
      </section>

      <div className={styles.ctaRow}>
        <Link className={styles.ctaPrimary} to="/registration">
          {t("info.forEmployers.ctaRegister")}
        </Link>
        <Link className={styles.ctaSecondary} to="/how-it-works#employers">
          {t("info.forEmployers.ctaHowItWorks")}
        </Link>
        <Link className={styles.ctaSecondary} to="/login">
          {t("header.login")}
        </Link>
      </div>
    </InfoPageLayout>
  );
};

export default ForEmployersPage;
