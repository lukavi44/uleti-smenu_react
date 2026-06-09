import { useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import styles from "./MarketingSection.module.scss";

const VALUE_PROPS = [1, 2, 3] as const;

const MarketingSection = () => {
  const { t } = useTranslation();
  const { authStatus } = useContext(AuthContext);
  const isLoggedIn = authStatus === "authenticated";

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2>{t("home.marketingTitle")}</h2>
          <p>{t("home.marketingSubtitle")}</p>
        </header>

        <div className={styles.valueGrid}>
          {VALUE_PROPS.map((item) => (
            <article key={item} className={styles.valueCard}>
              <h3>{t(`home.valueProp${item}Title`)}</h3>
              <p>{t(`home.valueProp${item}Text`)}</p>
            </article>
          ))}
        </div>

        <div className={styles.audienceGrid}>
          <article className={styles.audienceCard}>
            <h3>{t("home.audienceEmployeesTitle")}</h3>
            <p>{t("home.audienceEmployeesText")}</p>
            {!isLoggedIn ? (
              <Link className={styles.ctaPrimary} to="/registration-user">
                {t("home.audienceEmployeesCta")}
              </Link>
            ) : (
              <Link className={styles.ctaPrimary} to="/oglasi-za-posao">
                {t("home.audienceEmployeesBrowseCta")}
              </Link>
            )}
          </article>

          <article className={styles.audienceCard}>
            <h3>{t("home.audienceEmployersTitle")}</h3>
            <p>{t("home.audienceEmployersText")}</p>
            {!isLoggedIn ? (
              <Link className={styles.ctaPrimary} to="/registration">
                {t("home.audienceEmployersCta")}
              </Link>
            ) : (
              <Link className={styles.ctaPrimary} to="/oglasi-za-posao">
                {t("home.audienceEmployersPostCta")}
              </Link>
            )}
          </article>
        </div>

        <div className={styles.footerCta}>
          <Link className={styles.ctaSecondary} to="/how-it-works">
            {t("home.marketingHowItWorksCta")}
          </Link>
          <Link className={styles.ctaSecondary} to="/about">
            {t("home.marketingAboutCta")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MarketingSection;
