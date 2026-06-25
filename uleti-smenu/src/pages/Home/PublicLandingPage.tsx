import { useMediaQuery } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Footer from "../../components/Footer/Footer";
import MarketingSection from "../../components/Home/MarketingSection";
import HeroPlatformStats from "../../components/Home/HeroPlatformStats";
import styles from "./PublicLandingPage.module.scss";

const PublicLandingPage = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={styles.heroOrbs} aria-hidden="true">
          <span className={styles.orbOne} />
          <span className={styles.orbTwo} />
        </div>
        <div className={styles.dotGrid} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>{t("home.heroEyebrow")}</span>
            <h1 className={styles.heroTitle}>{t("home.heroTitle")}</h1>
            <p className={styles.heroSubtitle}>{t("home.heroSubtitle")}</p>
            <p className={styles.heroDescription}>{t("home.heroDescription")}</p>

            <div className={styles.heroCtas}>
              <NavLink className={`${styles.button} ${styles.buttonPrimary}`} to="/registration/candidate">
                {t("home.heroCtaEmployee")}
              </NavLink>
              <NavLink className={`${styles.button} ${styles.buttonSecondary}`} to="/registration/employer">
                {t("home.heroCtaEmployer")}
              </NavLink>
            </div>

            <NavLink className={styles.heroLink} to="/how-it-works">
              {t("home.heroCtaHowItWorks")}
              <ArrowRightIcon className={styles.heroLinkIcon} aria-hidden="true" />
            </NavLink>

            {isMobile ? (
              <div className={styles.heroStatsMobile}>
                <HeroPlatformStats showIcons />
              </div>
            ) : null}
          </div>

          {!isMobile ? (
            <div className={styles.heroVisual}>
              <div className={styles.heroVisualCard}>
                <HeroPlatformStats compact showIcons />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <MarketingSection variant="landing" />
      <Footer variant="landing" />
    </>
  );
};

export default PublicLandingPage;
