import { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Footer from "../../components/Footer/Footer";
import SubscriptionBanner from "../../components/Billing/SubscriptionBanner";
import { BillingOverview, BillingPlan } from "../../models/Billing.model";
import { Employer } from "../../models/User.model";
import {
  CreateCheckoutSession,
  CreatePortalSession,
  GetMyBilling,
} from "../../services/billing-service";
import { AuthContext } from "../../store/Auth-context";
import CandidatePageHeader from "../../components/Candidate/CandidatePageHeader";
import { useIsEmployerShell } from "../../hooks/useIsEmployerShell";
import styles from "./UpgradePage.module.scss";

const billingReturnBase = () => `${window.location.origin}/billing/upgrade`;

const UpgradePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { role, me, authStatus } = useContext(AuthContext);
  const isEmployerShell = useIsEmployerShell();
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

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

  useEffect(() => {
    if (authStatus === "authenticated" && role === "Employer") {
      void loadBilling();
    }
  }, [authStatus, role]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") toast.success(t("billing.checkoutSuccess"));
    if (checkout === "canceled") toast.info(t("billing.checkoutCanceled"));
  }, [searchParams, t]);

  const handleSubscribe = async (plan: BillingPlan) => {
    if (!billing?.paymentsEnabled) {
      toast.info(t("billing.paymentsComingSoon"));
      return;
    }

    setBusyPlanId(plan.id);
    try {
      const base = billingReturnBase();
      const response = await CreateCheckoutSession(
        plan.id,
        `${base}?checkout=success`,
        `${base}?checkout=canceled`
      );
      window.location.href = response.data.checkoutUrl;
    } catch {
      toast.error(t("billing.checkoutError"));
      setBusyPlanId(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await CreatePortalSession(billingReturnBase());
      window.location.href = response.data.portalUrl;
    } catch {
      toast.error(t("billing.portalError"));
      setPortalLoading(false);
    }
  };

  if (authStatus === "loading" || isLoading) {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated" || role !== "Employer") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  const employer = me as Employer;
  const subscription = billing?.subscription ?? employer.subscription;

  const formatInterval = (plan: BillingPlan) => {
    if (plan.billingInterval === "pack") return t("billing.perPack");
    if (plan.billingInterval === "year") return t("billing.perYear");
    return t("billing.perMonth");
  };

  return (
    <>
      <main className={`${styles.page} ${isEmployerShell ? styles.pageShell : ""}`}>
        {isEmployerShell ? (
          <CandidatePageHeader
            title={t("billing.upgradeTitle")}
            subtitle={t("billing.upgradeIntro")}
          />
        ) : (
          <>
            <Link className={styles.backLink} to="/profile">
              {t("billing.backToProfile")}
            </Link>
            <h1>{t("billing.upgradeTitle")}</h1>
            <p className={styles.intro}>{t("billing.upgradeIntro")}</p>
          </>
        )}

        <SubscriptionBanner subscription={subscription} onManageBilling={handleManageBilling} />

        {subscription?.canManageBilling && (
          <button
            type="button"
            className={styles.portalBtn}
            disabled={portalLoading}
            onClick={() => void handleManageBilling()}
          >
            {portalLoading ? t("common.loading") : t("billing.manageBilling")}
          </button>
        )}

        {billing && !billing.paymentsEnabled && billing.message && (
          <div className={styles.notice}>{billing.message}</div>
        )}

        {subscription && (
          <p className={styles.mutedText}>
            {t("billing.usageSummary", {
              credits: subscription.postCredits ?? 0,
              maxPosts: subscription.maxActivePosts ?? 0,
            })}
          </p>
        )}

        <div className={styles.planGrid}>
          {(billing?.plans ?? []).map((plan) => (
            <article key={plan.id} className={styles.planCard}>
              <h2>{plan.title}</h2>
              <p className={styles.price}>
                {plan.cost.toLocaleString()} {plan.currency}
                <span className={styles.mutedText}> / {formatInterval(plan)}</span>
              </p>
              {plan.creditsIncluded > 0 && (
                <p className={styles.mutedText}>
                  {t("billing.creditsIncluded", { count: plan.creditsIncluded })}
                </p>
              )}
              <p className={styles.description}>{plan.description}</p>
              <button
                type="button"
                className={styles.subscribeBtn}
                disabled={!billing?.paymentsEnabled || busyPlanId === plan.id}
                onClick={() => void handleSubscribe(plan)}
              >
                {busyPlanId === plan.id
                  ? t("common.loading")
                  : plan.checkoutMode === "payment"
                    ? t("billing.buyCredits")
                    : t("billing.subscribe")}
              </button>
            </article>
          ))}
        </div>

        {(billing?.plans.length ?? 0) === 0 && (
          <p className={styles.mutedText}>{t("billing.noPlans")}</p>
        )}
      </main>
      {!isEmployerShell ? <Footer /> : null}
    </>
  );
};

export default UpgradePage;
