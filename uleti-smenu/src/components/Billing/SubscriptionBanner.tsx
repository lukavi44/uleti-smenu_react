import { useTranslation } from "react-i18next";
import { EmployerSubscription } from "../../models/Subscription.model";
import styles from "./SubscriptionBanner.module.scss";

interface SubscriptionBannerProps {
  subscription?: EmployerSubscription;
}

const SubscriptionBanner = ({ subscription }: SubscriptionBannerProps) => {
  const { t } = useTranslation();

  if (!subscription || subscription.status === "None")
    return null;

  if (subscription.status === "Expired") {
    return (
      <div className={`${styles.banner} ${styles.expired}`}>
        <strong>{t("billing.expiredTitle")}</strong>
        <p>{t("billing.expiredText")}</p>
      </div>
    );
  }

  if (subscription.status === "Trial") {
    const isEndingSoon = subscription.daysRemaining <= 14;
    return (
      <div className={`${styles.banner} ${isEndingSoon ? styles.warning : styles.trial}`}>
        <strong>{t("billing.trialTitle", { days: subscription.daysRemaining })}</strong>
        <p>
          {isEndingSoon
            ? t("billing.trialEndingSoon")
            : t("billing.trialActive", { date: formatDate(subscription.subscriptionStop) })}
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.banner} ${styles.active}`}>
      <strong>{t("billing.activeTitle", { plan: subscription.planTitle })}</strong>
      <p>{t("billing.activeText", { date: formatDate(subscription.subscriptionStop) })}</p>
    </div>
  );
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

export default SubscriptionBanner;
