import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import styles from "./EmployerProfileIncompleteBanner.module.scss";

type EmployerProfileIncompleteBannerProps = {
  onCtaClick: () => void;
  variant?: "profile" | "home";
};

const EmployerProfileIncompleteBanner = ({
  onCtaClick,
  variant = "profile",
}: EmployerProfileIncompleteBannerProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.banner} role="status">
      <div className={styles.content}>
        <span className={styles.iconWrap} aria-hidden>
          <ExclamationTriangleIcon className={styles.icon} />
        </span>
        <div className={styles.text}>
          <p className={styles.title}>
            {variant === "home"
              ? t("profile.incomplete.homeBannerTitle")
              : t("profile.incomplete.bannerTitle")}
          </p>
          <p className={styles.subtitle}>
            {variant === "home"
              ? t("profile.incomplete.homeBannerSubtitle")
              : t("profile.incomplete.bannerSubtitle")}
          </p>
        </div>
      </div>
      <button type="button" className={styles.cta} onClick={onCtaClick}>
        {t("profile.incomplete.cta")}
      </button>
    </div>
  );
};

export default EmployerProfileIncompleteBanner;
