import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EmployerSubscription } from "../../models/Subscription.model";
import styles from "./SubscriptionBanner.module.scss";

interface SubscriptionBannerProps {
  subscription?: EmployerSubscription;
  onManageBilling?: () => void;
}

const SubscriptionBanner = ({ subscription, onManageBilling }: SubscriptionBannerProps) => {
  const { t } = useTranslation();

  if (!subscription)
    return null;

  if (subscription.status === "None" && subscription.canPost) {
    const credits = subscription.freePostingCredits ?? subscription.postCredits ?? 0;
    return (
      <div className={`${styles.banner} ${styles.trial}`}>
        <strong>{t("billing.freeCreditsBannerTitle", { count: credits })}</strong>
        <p>{t("billing.freeCreditsBannerText")}</p>
      </div>
    );
  }

  if (!subscription || subscription.status === "None")
    return null;

  if (subscription.needsAttention || subscription.status === "PastDue") {
    return (
      <div className={`${styles.banner} ${styles.warning}`}>
        <strong>{t("billing.needsAttentionTitle")}</strong>
        <p>{t("billing.needsAttentionText")}</p>
        <div className={styles.actions}>
          <Link className={styles.upgradeLink} to="/billing/upgrade">
            {t("billing.viewPlans")}
          </Link>
          {subscription.canManageBilling && onManageBilling && (
            <button type="button" className={styles.manageBtn} onClick={onManageBilling}>
              {t("billing.manageBilling")}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (subscription.status === "Expired" || subscription.status === "Incomplete") {
    if (subscription.canPost) return null;

    return (
      <div className={`${styles.banner} ${styles.expired}`}>
        <strong>{t("billing.expiredTitle")}</strong>
        <p>{t("billing.expiredText")}</p>
        <Link className={styles.upgradeLink} to="/billing/upgrade">
          {t("billing.viewPlans")}
        </Link>
      </div>
    );
  }

  if (subscription.status === "Trialing") {
    const isEndingSoon = subscription.daysRemaining <= 14;
    return (
      <div className={`${styles.banner} ${isEndingSoon ? styles.warning : styles.trial}`}>
        <strong>{t("billing.trialTitle", { days: subscription.daysRemaining })}</strong>
        <p>
          {isEndingSoon
            ? t("billing.trialEndingSoon")
            : t("billing.trialActive", { date: formatDate(subscription.subscriptionStop) })}
        </p>
        {isEndingSoon && (
          <Link className={styles.upgradeLink} to="/billing/upgrade">
            {t("billing.viewPlans")}
          </Link>
        )}
      </div>
    );
  }

  if (subscription.status === "Canceled") {
    return (
      <div className={`${styles.banner} ${styles.warning}`}>
        <strong>{t("billing.canceledTitle")}</strong>
        <p>{t("billing.canceledText", { date: formatDate(subscription.subscriptionStop) })}</p>
        {subscription.canManageBilling && onManageBilling && (
          <button type="button" className={styles.manageBtn} onClick={onManageBilling}>
            {t("billing.manageBilling")}
          </button>
        )}
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
