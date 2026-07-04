import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CreditCardIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import Footer from "../../components/Footer/Footer";
import { BillingOverview, BillingPlan } from "../../models/Billing.model";
import { Employer } from "../../models/User.model";
import {
  CreateCheckoutSession,
  CreatePortalSession,
  CreateWalletTopUpSession,
  GetMyBilling,
} from "../../services/billing-service";
import { AuthContext } from "../../store/Auth-context";
import ShellPageHeader from "../../components/Layout/ShellPageHeader";
import { useIsEmployerShell } from "../../hooks/useIsEmployerShell";
import styles from "./UpgradePage.module.scss";

const billingReturnBase = () => `${window.location.origin}/billing/upgrade`;

type BillingStep = "choice" | "wallet" | "subscription";

const QUICK_TOP_UP_AMOUNTS = [500, 1000, 2000, 3000, 5000, 10000];

const UpgradePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { role, me, authStatus } = useContext(AuthContext);
  const isEmployerShell = useIsEmployerShell();
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [step, setStep] = useState<BillingStep>("choice");
  const [isLoading, setIsLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [busyTopUpAmount, setBusyTopUpAmount] = useState<number | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");

  const loadBilling = async () => {
    try {
      const billingResponse = await GetMyBilling();
      setBilling(billingResponse.data);
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

  const handleTopUp = async () => {
    if (!billing?.paymentsEnabled) {
      toast.info(t("billing.paymentsComingSoon"));
      return;
    }

    const amount = customAmount
      ? Number(customAmount.replace(/\s/g, "").replace(",", "."))
      : selectedTopUpAmount;

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t("billing.invalidTopUpAmount"));
      return;
    }

    setBusyTopUpAmount(amount);
    try {
      const base = billingReturnBase();
      const response = await CreateWalletTopUpSession(
        amount,
        `${base}?checkout=success`,
        `${base}?checkout=canceled`
      );
      window.location.href = response.data.checkoutUrl;
    } catch {
      toast.error(t("billing.checkoutError"));
      setBusyTopUpAmount(null);
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

  const employer = me as Employer;
  const subscription = billing?.subscription ?? employer.subscription;
  const currency = subscription?.currency ?? "RSD";
  const walletBalance = subscription?.walletBalance ?? 0;

  const formatMoney = (value: number, compact = false) => {
    const formatted = value.toLocaleString("sr-RS");
    return compact ? `${formatted} ${currency}` : `${formatted} ${currency}`;
  };

  const getPlanFeatures = (planKind?: string) => {
    const key = planKind?.toLowerCase() ?? "";
    if (key === "unlimited" || key === "pro") {
      return [
        t("billing.planFeatures.unlimited.posts"),
        t("billing.planFeatures.unlimited.noWallet"),
        t("billing.planFeatures.unlimited.support"),
        t("billing.planFeatures.unlimited.premium"),
      ];
    }
    return [
      t("billing.planFeatures.basic.posts"),
      t("billing.planFeatures.basic.noWallet"),
      t("billing.planFeatures.basic.support"),
    ];
  };

  const plans = billing?.plans ?? [];
  const currentPlan = plans.find((plan) => {
    if (!subscription?.planTitle) return false;
    return (
      plan.title.toLowerCase() === subscription.planTitle.toLowerCase() ||
      plan.planKind.toLowerCase() === (subscription.planKind ?? "").toLowerCase()
    );
  });
  const hasActiveSubscription = subscription?.status === "Active" && subscription.isActive;
  const recommendedPlanId = useMemo(() => {
    const unlimited = plans.find((plan) => plan.planKind.toLowerCase() === "unlimited");
    return unlimited?.id ?? plans.at(-1)?.id;
  }, [plans]);

  const headerTitle = hasActiveSubscription
    ? t("billing.activeSubscription.title")
    : step === "wallet"
      ? t("billing.walletFlowTitle")
      : step === "subscription"
        ? t("billing.subscriptionFlowTitle")
        : t("billing.paymentChoiceTitle");

  const headerSubtitle = hasActiveSubscription
    ? t("billing.activeSubscription.subtitle")
    : step === "wallet"
      ? t("billing.walletFlowSubtitle")
      : step === "subscription"
        ? t("billing.subscriptionFlowSubtitle")
        : t("billing.paymentChoiceIntro");

  if (authStatus === "loading" || isLoading) {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated" || role !== "Employer") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  return (
    <>
      <main className={`${styles.page} ${isEmployerShell ? styles.pageShell : ""}`}>
        {isEmployerShell ? (
          <ShellPageHeader
            title={headerTitle}
            subtitle={headerSubtitle}
          />
        ) : (
          <>
            <Link className={styles.backLink} to="/profile">
              {t("billing.backToProfile")}
            </Link>
            <h1 className={styles.pageTitle}>{headerTitle}</h1>
            <p className={styles.intro}>{headerSubtitle}</p>
          </>
        )}

        {billing && !billing.paymentsEnabled && (
          <div className={styles.notice}>{t("billing.paymentsDisabledNotice")}</div>
        )}

        {subscription?.needsAttention && (
          <div className={styles.notice}>
            <strong>{t("billing.needsAttentionTitle")}</strong>
            <p>{t("billing.needsAttentionText")}</p>
          </div>
        )}

        {hasActiveSubscription ? (
          <section className={styles.activeSubscriptionPanel}>
            <div className={styles.activePackageHeader}>
              <div className={styles.activeIconWrap}>
                <CheckCircleIcon aria-hidden />
              </div>
              <div>
                <div className={styles.activeTitleRow}>
                  <h2>{subscription.planTitle || currentPlan?.title}</h2>
                  <span>{t("billing.activeSubscription.activeBadge")}</span>
                </div>
                <p>
                  {formatMoney(currentPlan?.cost ?? 0)} / {t("billing.perMonth")}
                </p>
              </div>
            </div>

            <div className={styles.activeMetaGrid}>
              <div>
                <CalendarDaysIcon aria-hidden />
                <span>{t("billing.activeSubscription.nextRenewal")}</span>
                <strong>
                  {subscription.subscriptionStop
                    ? new Date(subscription.subscriptionStop).toLocaleDateString("sr-RS")
                    : "—"}
                </strong>
              </div>
              <div>
                <CreditCardIcon aria-hidden />
                <span>{t("billing.activeSubscription.paymentMethod")}</span>
                <strong>{t("billing.activeSubscription.paymentMethodValue")}</strong>
              </div>
              <div>
                <ShieldCheckIcon aria-hidden />
                <span>{t("billing.activeSubscription.status")}</span>
                <strong>{t("billing.activeSubscription.activeBadge")}</strong>
              </div>
            </div>

            <div className={styles.activeBenefits}>
              <h3>{t("billing.activeSubscription.benefitsTitle", { plan: subscription.planTitle })}</h3>
              <ul className={styles.benefitList}>
                {getPlanFeatures(subscription.planKind).map((feature) => (
                  <li key={feature}>
                    <CheckCircleIcon aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.activeActions}>
              <button
                type="button"
                className={styles.cancelSubscriptionButton}
                disabled={!subscription.canManageBilling || portalLoading}
                onClick={() => void handleManageBilling()}
              >
                {portalLoading ? t("common.loading") : t("billing.activeSubscription.cancel")}
              </button>
              <button
                type="button"
                className={styles.changePlanButton}
                disabled={!subscription.canManageBilling || portalLoading}
                onClick={() => void handleManageBilling()}
              >
                {t("billing.activeSubscription.changePlan")}
              </button>
            </div>
          </section>
        ) : step === "choice" ? (
          <>
            <div className={styles.choiceGrid}>
              <article className={styles.choiceCard}>
                <div className={styles.choiceIconWrap}>
                  <WalletIcon aria-hidden />
                </div>
                <h2>{t("billing.payPerPostTitle")}</h2>
                <p>{t("billing.payPerPostChoiceDescription")}</p>
                <ul className={styles.benefitList}>
                  <li><CheckCircleIcon aria-hidden />{t("billing.payPerPostBenefits.topUp")}</li>
                  <li><CheckCircleIcon aria-hidden />{t("billing.payPerPostBenefits.noMonthly")}</li>
                  <li><CheckCircleIcon aria-hidden />{t("billing.payPerPostBenefits.occasional")}</li>
                </ul>
                <button type="button" className={styles.primaryButton} onClick={() => setStep("wallet")}>
                  {t("billing.continue")}
                </button>
              </article>

              <article className={styles.choiceCard}>
                <div className={`${styles.choiceIconWrap} ${styles.choiceIconGreen}`}>
                  <CalendarDaysIcon aria-hidden />
                </div>
                <h2>{t("billing.subscriptionPathTitle")}</h2>
                <p>{t("billing.subscriptionChoiceDescription")}</p>
                <ul className={styles.benefitList}>
                  <li><CheckCircleIcon aria-hidden />{t("billing.subscriptionBenefits.morePosts")}</li>
                  <li><CheckCircleIcon aria-hidden />{t("billing.subscriptionBenefits.support")}</li>
                  <li><CheckCircleIcon aria-hidden />{t("billing.subscriptionBenefits.value")}</li>
                </ul>
                <button type="button" className={styles.primaryButton} onClick={() => setStep("subscription")}>
                  {t("billing.viewPackages")}
                </button>
              </article>
            </div>
            <p className={styles.infoNote}>
              <InformationCircleIcon aria-hidden />
              {t("billing.paymentMethodChangeNote")}
            </p>
          </>
        ) : step === "wallet" ? (
          <section className={styles.flowPanel}>
            <button type="button" className={styles.inlineBackButton} onClick={() => setStep("choice")}>
              <ArrowLeftIcon aria-hidden />
              {t("common.back")}
            </button>
            <div className={styles.walletBalanceBox}>
              <span>{t("billing.currentBalance")}</span>
              <strong>{formatMoney(walletBalance)}</strong>
            </div>
            <h2>{t("billing.chooseAmount")}</h2>
            <div className={styles.topUpGrid}>
              {QUICK_TOP_UP_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`${styles.topUpChip} ${
                    !customAmount && selectedTopUpAmount === amount ? styles.topUpChipSelected : ""
                  }`}
                  onClick={() => {
                    setSelectedTopUpAmount(amount);
                    setCustomAmount("");
                  }}
                >
                  + {formatMoney(amount, true)}
                </button>
              ))}
            </div>
            <label className={styles.customAmountField}>
              <span>{t("billing.customAmount")}</span>
              <div>
                <input
                  type="number"
                  min={1}
                  placeholder={t("billing.customAmountPlaceholder")}
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                />
                <strong>{currency}</strong>
              </div>
            </label>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={!billing?.paymentsEnabled || busyTopUpAmount !== null}
              onClick={() => void handleTopUp()}
            >
              {busyTopUpAmount !== null ? t("common.loading") : t("billing.topUpWalletAction")}
            </button>
            <p className={styles.securityNote}>
              <LockClosedIcon aria-hidden />
              {t("billing.secureStripe")}
            </p>
          </section>
        ) : (
          <section className={styles.flowSection}>
            <button type="button" className={styles.inlineBackButton} onClick={() => setStep("choice")}>
              <ArrowLeftIcon aria-hidden />
              {t("common.back")}
            </button>
            <div className={styles.pricingGrid}>
              {plans.map((plan) => {
                const isRecommended = plan.id === recommendedPlanId;
                return (
                  <article
                    key={plan.id}
                    className={`${styles.pricingCard} ${isRecommended ? styles.pricingCardRecommended : ""}`}
                  >
                    {isRecommended ? (
                      <span className={styles.recommendedBadge}>{t("billing.recommendedPackage")}</span>
                    ) : null}
                    <h2>{plan.title}</h2>
                    <p className={styles.pricingPrice}>
                      {plan.cost.toLocaleString("sr-RS")} {plan.currency}
                      <span> / {t("billing.perMonth")}</span>
                    </p>
                    <ul className={styles.benefitList}>
                      {getPlanFeatures(plan.planKind).map((feature) => (
                        <li key={feature}>
                          <CheckCircleIcon aria-hidden />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      disabled={!billing?.paymentsEnabled || busyPlanId === plan.id}
                      onClick={() => void handleSubscribe(plan)}
                    >
                      {busyPlanId === plan.id ? t("common.loading") : t("billing.selectPlan")}
                    </button>
                  </article>
                );
              })}
            </div>
            {plans.length === 0 ? <p className={styles.mutedText}>{t("billing.noPlans")}</p> : null}
            <p className={styles.infoNote}>
              <InformationCircleIcon aria-hidden />
              {t("billing.subscriptionRenewalNote")}
            </p>
          </section>
        )}
      </main>
      {!isEmployerShell ? <Footer /> : null}
    </>
  );
};

export default UpgradePage;
