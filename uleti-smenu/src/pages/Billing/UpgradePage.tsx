import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Footer from "../../components/Footer/Footer";
import SubscriptionBanner from "../../components/Billing/SubscriptionBanner";
import { BillingOverview } from "../../models/Billing.model";
import { Employer } from "../../models/User.model";
import { GetMyBilling } from "../../services/billing-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./UpgradePage.module.scss";

const UpgradePage = () => {
  const { t } = useTranslation();
  const { role, me, authStatus } = useContext(AuthContext);
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const response = await GetMyBilling();
        setBilling(response.data);
      } catch {
        toast.error(t("billing.upgradeLoadError"));
      } finally {
        setIsLoading(false);
      }
    };

    if (authStatus === "authenticated" && role === "Employer") {
      void loadBilling();
    }
  }, [authStatus, role, t]);

  const handleSubscribe = () => {
    toast.info(t("billing.paymentsComingSoon"));
  };

  if (authStatus === "loading" || isLoading) {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated" || role !== "Employer") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  const employer = me as Employer;
  const subscription = billing?.subscription ?? employer.subscription;

  return (
    <>
      <main className={styles.page}>
        <Link className={styles.backLink} to="/profile">
          {t("billing.backToProfile")}
        </Link>

        <h1>{t("billing.upgradeTitle")}</h1>
        <p className={styles.intro}>{t("billing.upgradeIntro")}</p>

        <SubscriptionBanner subscription={subscription} />

        {billing && !billing.paymentsEnabled && (
          <div className={styles.notice}>{billing.message}</div>
        )}

        <div className={styles.planGrid}>
          {(billing?.plans ?? []).map((plan) => (
            <article key={plan.id} className={styles.planCard}>
              <h2>{plan.title}</h2>
              <p className={styles.price}>
                {plan.cost.toLocaleString()} {plan.currency}
                <span className={styles.mutedText}>
                  {" "}
                  / {plan.billingInterval === "year" ? t("billing.perYear") : t("billing.perMonth")}
                </span>
              </p>
              <p className={styles.description}>{plan.description}</p>
              <button
                type="button"
                className={styles.subscribeBtn}
                disabled={!billing?.paymentsEnabled}
                onClick={handleSubscribe}
              >
                {billing?.paymentsEnabled ? t("billing.subscribe") : t("billing.contactToUpgrade")}
              </button>
            </article>
          ))}
        </div>

        {(billing?.plans.length ?? 0) === 0 && (
          <p className={styles.mutedText}>{t("billing.noPlans")}</p>
        )}
      </main>
      <Footer />
    </>
  );
};

export default UpgradePage;
