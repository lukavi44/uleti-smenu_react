import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BuildingStorefrontIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import AuthPageLayout from "../../components/Auth/AuthPageLayout";
import layoutStyles from "../../components/Auth/AuthPageLayout.module.scss";
import styles from "./RegistrationChoice.module.scss";

const RegistrationChoicePage = () => {
  const { t } = useTranslation();

  const options = [
    {
      to: "/registration/candidate",
      title: t("registration.choiceCandidateTitle"),
      description: t("registration.choiceCandidateDescription"),
      cta: t("registration.choiceCandidateCta"),
      Icon: UserIcon,
      variant: "candidate" as const,
    },
    {
      to: "/registration/employer",
      title: t("registration.choiceEmployerTitle"),
      description: t("registration.choiceEmployerDescription"),
      cta: t("registration.choiceEmployerCta"),
      Icon: BuildingStorefrontIcon,
      variant: "employer" as const,
    },
  ];

  return (
    <AuthPageLayout visualCaption={t("registration.choiceVisualCaption")}>
      <h1 className={layoutStyles.title}>{t("registration.choiceTitle")}</h1>
      <p className={layoutStyles.subtitle}>{t("registration.choiceSubtitle")}</p>

      <div className={styles.options}>
        {options.map(({ to, title, description, cta, Icon, variant }) => (
          <Link
            key={to}
            to={to}
            className={`${styles.optionCard} ${styles[variant]}`}
          >
            <span className={styles.optionIcon} aria-hidden="true">
              <Icon />
            </span>
            <span className={styles.optionContent}>
              <span className={styles.optionTitle}>{title}</span>
              <span className={styles.optionDescription}>{description}</span>
            </span>
            <span className={styles.optionCta}>
              {cta}
              <ArrowRightIcon className={styles.optionArrow} />
            </span>
          </Link>
        ))}
      </div>

      <p className={layoutStyles.footerLine}>
        {t("registration.loginPrompt")}{" "}
        <Link to="/login">{t("registration.loginLink")}</Link>
      </p>
    </AuthPageLayout>
  );
};

export default RegistrationChoicePage;
