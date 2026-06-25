import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  BoltIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  StarIcon,
  UserIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../store/Auth-context";
import { useContext } from "react";
import styles from "./MarketingSection.module.scss";

const VALUE_PROPS = [
  { key: 1, Icon: ShieldCheckIcon },
  { key: 2, Icon: BoltIcon },
  { key: 3, Icon: StarIcon },
] as const;

type MarketingSectionProps = {
  variant?: "default" | "landing";
};

const MarketingSection = ({ variant = "default" }: MarketingSectionProps) => {
  const { t } = useTranslation();
  const { authStatus } = useContext(AuthContext);
  const isLoggedIn = authStatus === "authenticated";
  const isLanding = variant === "landing";

  return (
    <section className={`${styles.section} ${isLanding ? styles.sectionLanding : ""}`}>
      <div className={styles.inner}>
        <header className={styles.header}>
          {isLanding ? (
            <span className={styles.eyebrow}>{t("home.marketingEyebrow")}</span>
          ) : null}
          <h2>{t("home.marketingTitle")}</h2>
          <p>{t("home.marketingSubtitle")}</p>
        </header>

        <div className={styles.valueGrid}>
          {VALUE_PROPS.map(({ key, Icon }) => (
            <article key={key} className={styles.valueCard}>
              <span className={styles.valueIcon}>
                <Icon aria-hidden="true" />
              </span>
              <h3>{t(`home.valueProp${key}Title`)}</h3>
              <p>{t(`home.valueProp${key}Text`)}</p>
            </article>
          ))}
        </div>

        <div className={styles.audienceGrid}>
          <article className={`${styles.audienceCard} ${styles.audienceCardEmployee}`}>
            <span className={styles.audienceIcon}>
              <UserIcon aria-hidden="true" />
            </span>
            <h3>{t("home.audienceEmployeesTitle")}</h3>
            <p>{t("home.audienceEmployeesText")}</p>
            {!isLoggedIn ? (
              <Link className={styles.ctaPrimary} to="/registration/candidate">
                {t("home.audienceEmployeesCta")}
                <ArrowRightIcon className={styles.ctaArrow} aria-hidden="true" />
              </Link>
            ) : (
              <Link className={styles.ctaPrimary} to="/oglasi-za-posao">
                {t("home.audienceEmployeesBrowseCta")}
                <ArrowRightIcon className={styles.ctaArrow} aria-hidden="true" />
              </Link>
            )}
          </article>

          <article className={`${styles.audienceCard} ${styles.audienceCardEmployer}`}>
            <span className={styles.audienceIcon}>
              <BuildingStorefrontIcon aria-hidden="true" />
            </span>
            <h3>{t("home.audienceEmployersTitle")}</h3>
            <p>{t("home.audienceEmployersText")}</p>
            {!isLoggedIn ? (
              <Link className={styles.ctaEmployer} to="/registration/employer">
                {t("home.audienceEmployersCta")}
                <ArrowRightIcon className={styles.ctaArrow} aria-hidden="true" />
              </Link>
            ) : (
              <Link className={styles.ctaEmployer} to="/oglasi-za-posao">
                {t("home.audienceEmployersPostCta")}
                <ArrowRightIcon className={styles.ctaArrow} aria-hidden="true" />
              </Link>
            )}
          </article>
        </div>

        {isLanding ? (
          <>
            <div className={styles.footerCta}>
              <Link className={styles.ctaSecondary} to="/how-it-works">
                <PlayCircleIcon className={styles.ctaSecondaryIcon} aria-hidden="true" />
                {t("home.marketingHowItWorksCta")}
              </Link>
              <Link className={styles.ctaSecondary} to="/about">
                {t("home.marketingAboutCta")}
              </Link>
            </div>

            <div className={styles.trustBanner}>
              <ShieldCheckIcon className={styles.trustIcon} aria-hidden="true" />
              <p>
                {t("home.trustBannerPrefix")}
                <span className={styles.trustHighlightBlue}>{t("home.trustBannerRestaurants")}</span>
                {t("home.trustBannerMiddle")}
                <span className={styles.trustHighlightGreen}>{t("home.trustBannerCandidates")}</span>
                {t("home.trustBannerSuffix")}
              </p>
            </div>
          </>
        ) : (
          <div className={styles.footerCta}>
            <Link className={styles.ctaSecondary} to="/how-it-works">
              {t("home.marketingHowItWorksCta")}
            </Link>
            <Link className={styles.ctaSecondary} to="/about">
              {t("home.marketingAboutCta")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default MarketingSection;
