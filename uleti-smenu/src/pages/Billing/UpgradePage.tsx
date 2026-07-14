import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  GiftIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import Footer from "../../components/Footer/Footer";
import { BillingOverview, BillingPlan, WalletTransaction } from "../../models/Billing.model";
import { Employer } from "../../models/User.model";
import {
  CreateCheckoutSession,
  CreatePortalSession,
  CreateWalletTopUpSession,
  GetMyBilling,
  GetWalletTransactions,
} from "../../services/billing-service";
import { AuthContext } from "../../store/Auth-context";
import ShellPageHeader from "../../components/Layout/ShellPageHeader";
import { useIsEmployerShell } from "../../hooks/useIsEmployerShell";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import styles from "./UpgradePage.module.scss";

const billingReturnBase = () => `${window.location.origin}/billing/upgrade`;
const TRANSACTION_PREVIEW_COUNT = 5;
const QUICK_TOP_UP_AMOUNTS = [500, 1000, 2000, 3000, 5000, 10000];

type PaymentPath = "wallet" | "subscription";

const UpgradePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { role, me, authStatus } = useContext(AuthContext);
  const isEmployerShell = useIsEmployerShell();
  const paymentSectionRef = useRef<HTMLElement>(null);

  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [busyTopUpAmount, setBusyTopUpAmount] = useState<number | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPaymentPath, setSelectedPaymentPath] = useState<PaymentPath>("wallet");
  const [expandedFlow, setExpandedFlow] = useState<PaymentPath | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const loadPageData = async () => {
    try {
      const [billingResponse, transactionsResponse] = await Promise.all([
        GetMyBilling(),
        GetWalletTransactions(50),
      ]);
      setBilling(billingResponse.data);
      setTransactions(transactionsResponse.data);
    } catch {
      toast.error(t("billing.upgradeLoadError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated" && role === "Employer") {
      void loadPageData();
    }
  }, [authStatus, role]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") toast.success(t("billing.checkoutSuccess"));
    if (checkout === "canceled") toast.info(t("billing.checkoutCanceled"));
  }, [searchParams, t]);

  const employer = me as Employer;
  const subscription = billing?.subscription ?? employer.subscription;
  const currency = subscription?.currency ?? "RSD";
  const walletBalance = subscription?.walletBalance ?? 0;
  const postCredits = subscription?.postCredits ?? subscription?.freePostingCredits ?? 0;
  const registrationFreeCredits = billing?.registrationFreeCredits ?? 5;
  const activePosts = subscription?.activeJobPostsCount ?? 0;
  const maxActivePosts = subscription?.maxActivePosts ?? 0;
  const plans = billing?.plans ?? [];
  const hasActiveSubscription = subscription?.status === "Active" && subscription.isActive;

  const currentPlan = plans.find((plan) => {
    if (!subscription?.planTitle) return false;
    return (
      plan.title.toLowerCase() === subscription.planTitle.toLowerCase() ||
      plan.planKind.toLowerCase() === (subscription.planKind ?? "").toLowerCase()
    );
  });

  const recommendedPlanId = useMemo(() => {
    const unlimited = plans.find((plan) => plan.planKind.toLowerCase() === "unlimited");
    return unlimited?.id ?? plans.at(-1)?.id;
  }, [plans]);

  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, TRANSACTION_PREVIEW_COUNT);

  const formatMoney = (value: number, compact = false) => {
    const formatted = value.toLocaleString("sr-RS");
    return compact ? `${formatted} ${currency}` : `${formatted} ${currency}`;
  };

  const formatTransactionDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    const date = formatDisplayDate(value);
    const time = parsed.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
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

  const getTransactionBadgeClass = (type: string) => {
    switch (type) {
      case "TopUp":
        return styles.badgeTopUp;
      case "JobPostCharge":
        return styles.badgeCharge;
      case "Refund":
        return styles.badgeRefund;
      case "ManualAdjustment":
        return styles.badgeAdjustment;
      default:
        return styles.badgeAdjustment;
    }
  };

  const getTransactionBadgeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TopUp: t("billing.transactionBadge.TopUp"),
      JobPostCharge: t("billing.transactionBadge.JobPostCharge"),
      Refund: t("billing.transactionBadge.Refund"),
      ManualAdjustment: t("billing.transactionBadge.ManualAdjustment"),
    };
    return labels[type] ?? type;
  };

  const scrollToPaymentSection = () => {
    paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  const creditsProgress = registrationFreeCredits > 0
    ? Math.min(100, Math.round((postCredits / registrationFreeCredits) * 100))
    : 0;

  const activePostsProgress =
    maxActivePosts > 0 ? Math.min(100, Math.round((activePosts / maxActivePosts) * 100)) : 0;

  const subscriptionLabel = hasActiveSubscription
    ? subscription?.planTitle || currentPlan?.title || t("billing.currentSubscription")
    : t("billing.noActiveSubscription");

  const subscriptionHint = hasActiveSubscription && subscription?.subscriptionStop
    ? t("billing.validUntil", {
        date: formatDisplayDate(subscription.subscriptionStop),
      })
    : t("billing.noSubscription");

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
          <ShellPageHeader title={t("billing.upgradeTitle")} subtitle={t("billing.upgradeIntro")} />
        ) : (
          <>
            <Link className={styles.backLink} to="/profile">
              {t("billing.backToProfile")}
            </Link>
            <h1 className={styles.pageTitle}>{t("billing.upgradeTitle")}</h1>
            <p className={styles.intro}>{t("billing.upgradeIntro")}</p>
          </>
        )}

        {subscription?.needsAttention ? (
          <div className={styles.notice}>
            <strong>{t("billing.needsAttentionTitle")}</strong>
            <p>{t("billing.needsAttentionText")}</p>
          </div>
        ) : null}

        <section className={styles.summaryGrid} aria-label={t("billing.upgradeTitle")}>
          <article className={styles.summaryCard}>
            <div className={styles.summaryCardHead}>
              <GiftIcon className={`${styles.summaryIcon} ${styles.summaryIconGreen}`} aria-hidden />
              <span>{t("billing.freeCredits")}</span>
            </div>
            <p className={styles.summaryValue}>
              {t("billing.creditsOfTotal", {
                remaining: postCredits,
                total: registrationFreeCredits,
              })}
            </p>
            <p className={styles.summaryHint}>{t("billing.creditsNeverExpire")}</p>
            <div className={styles.progressTrack}>
              <div
                className={`${styles.progressFill} ${styles.progressGreen}`}
                style={{ width: `${creditsProgress}%` }}
              />
            </div>
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.summaryCardHead}>
              <WalletIcon className={`${styles.summaryIcon} ${styles.summaryIconBlue}`} aria-hidden />
              <span>{t("billing.walletBalance")}</span>
            </div>
            <p className={styles.summaryValue}>{formatMoney(walletBalance)}</p>
            <p className={styles.summaryHint}>{t("billing.walletAvailable")}</p>
            <button type="button" className={styles.summaryActionLink} onClick={scrollToPaymentSection}>
              {t("billing.selectPaymentMethodShort")}
              <ChevronRightIcon className={styles.summaryActionIcon} aria-hidden />
            </button>
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.summaryCardHead}>
              <ShieldCheckIcon className={`${styles.summaryIcon} ${styles.summaryIconPurple}`} aria-hidden />
              <span>{t("billing.currentSubscription")}</span>
            </div>
            <p className={styles.summaryValue}>{subscriptionLabel}</p>
            <p className={styles.summaryHint}>{subscriptionHint}</p>
            {hasActiveSubscription ? (
              <button
                type="button"
                className={styles.summaryActionLink}
                disabled={!subscription?.canManageBilling || portalLoading}
                onClick={() => void handleManageBilling()}
              >
                {portalLoading ? t("common.loading") : t("billing.manageSubscriptionShort")}
              </button>
            ) : (
              <button
                type="button"
                className={styles.summaryActionLink}
                onClick={() => {
                  setSelectedPaymentPath("subscription");
                  setExpandedFlow("subscription");
                  scrollToPaymentSection();
                }}
              >
                {t("billing.viewPackages")}
                <ChevronRightIcon className={styles.summaryActionIcon} aria-hidden />
              </button>
            )}
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.summaryCardHead}>
              <ChartBarIcon className={`${styles.summaryIcon} ${styles.summaryIconOrange}`} aria-hidden />
              <span>{t("billing.activePosts")}</span>
            </div>
            <p className={styles.summaryValue}>
              {maxActivePosts > 0 ? `${activePosts} / ${maxActivePosts}` : activePosts}
            </p>
            <p className={styles.summaryHint}>
              {maxActivePosts > 0
                ? t("billing.activePostsHint", { active: activePosts, max: maxActivePosts })
                : t("billing.activePostsUnlimited")}
            </p>
            {maxActivePosts > 0 ? (
              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${styles.progressOrange}`}
                  style={{ width: `${activePostsProgress}%` }}
                />
              </div>
            ) : null}
          </article>
        </section>

        {hasActiveSubscription ? (
          <div className={styles.subscriptionBanner}>
            <strong>{subscription.planTitle || currentPlan?.title}</strong>
            <span>
              {subscription.subscriptionStop
                ? t("billing.validUntil", {
                    date: formatDisplayDate(subscription.subscriptionStop),
                  })
                : t("billing.activeSubscription.activeBadge")}
            </span>
            <button
              type="button"
              className={styles.summaryActionLink}
              disabled={!subscription.canManageBilling || portalLoading}
              onClick={() => void handleManageBilling()}
            >
              {portalLoading ? t("common.loading") : t("billing.manageSubscriptionShort")}
            </button>
          </div>
        ) : null}

        <section ref={paymentSectionRef} className={styles.paymentSection}>
            <div className={styles.paymentIntro}>
              <h2>{t("billing.paymentChoiceTitle")}</h2>
              <p>{t("billing.paymentChoiceIntro")}</p>
            </div>

            <div className={styles.choiceGrid}>
              <article
                className={`${styles.choiceCard} ${styles.choiceCardSelectable} ${
                  selectedPaymentPath === "wallet" ? styles.choiceCardSelected : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.choiceRadioButton}
                  aria-pressed={selectedPaymentPath === "wallet"}
                  onClick={() => setSelectedPaymentPath("wallet")}
                >
                  <span
                    className={`${styles.choiceRadio} ${
                      selectedPaymentPath === "wallet" ? styles.choiceRadioActive : ""
                    }`}
                  >
                    {selectedPaymentPath === "wallet" ? <span className={styles.choiceRadioDot} /> : null}
                  </span>
                </button>
                <div className={styles.choiceIconWrap}>
                  <WalletIcon aria-hidden />
                </div>
                <h2>{t("billing.payPerPostTitle")}</h2>
                <p>{t("billing.payPerPostChoiceDescription")}</p>
                <ul className={styles.benefitList}>
                  <li>
                    <CheckCircleIcon aria-hidden />
                    {t("billing.payPerPostBenefits.topUp")}
                  </li>
                  <li>
                    <CheckCircleIcon aria-hidden />
                    {t("billing.payPerPostBenefits.noMonthly")}
                  </li>
                  <li>
                    <CheckCircleIcon aria-hidden />
                    {t("billing.payPerPostBenefits.occasional")}
                  </li>
                </ul>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => {
                    setSelectedPaymentPath("wallet");
                    setExpandedFlow("wallet");
                  }}
                >
                  {t("billing.continue")}
                </button>
              </article>

              <article
                className={`${styles.choiceCard} ${styles.choiceCardSelectable} ${
                  selectedPaymentPath === "subscription" ? styles.choiceCardSelected : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.choiceRadioButton}
                  aria-pressed={selectedPaymentPath === "subscription"}
                  onClick={() => setSelectedPaymentPath("subscription")}
                >
                  <span
                    className={`${styles.choiceRadio} ${
                      selectedPaymentPath === "subscription" ? styles.choiceRadioActive : ""
                    }`}
                  >
                    {selectedPaymentPath === "subscription" ? (
                      <span className={styles.choiceRadioDot} />
                    ) : null}
                  </span>
                </button>
                <div className={`${styles.choiceIconWrap} ${styles.choiceIconGreen}`}>
                  <CalendarDaysIcon aria-hidden />
                </div>
                <h2>{t("billing.subscriptionPathTitle")}</h2>
                <p>{t("billing.subscriptionChoiceDescription")}</p>
                <ul className={styles.benefitList}>
                  <li>
                    <CheckCircleIcon aria-hidden />
                    {t("billing.subscriptionBenefits.morePosts")}
                  </li>
                  <li>
                    <CheckCircleIcon aria-hidden />
                    {t("billing.subscriptionBenefits.support")}
                  </li>
                  <li>
                    <CheckCircleIcon aria-hidden />
                    {t("billing.subscriptionBenefits.value")}
                  </li>
                </ul>
                <button
                  type="button"
                  className={styles.outlinePrimaryButton}
                  onClick={() => {
                    setSelectedPaymentPath("subscription");
                    setExpandedFlow("subscription");
                  }}
                >
                  {t("billing.viewPackages")}
                </button>
              </article>
            </div>

            {expandedFlow === "wallet" ? (
              <section className={`${styles.panel} ${styles.expandedPanel}`}>
                <div className={styles.panelHeader}>
                  <h2>{t("billing.walletFlowTitle")}</h2>
                  <p>{t("billing.walletFlowSubtitle")}</p>
                </div>
                <p className={styles.walletBalanceLarge}>{formatMoney(walletBalance)}</p>
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
                <div className={styles.customTopUpRow}>
                  <input
                    type="number"
                    min={1}
                    className={styles.customTopUpInput}
                    placeholder={t("billing.customAmountPlaceholder")}
                    value={customAmount}
                    onChange={(event) => setCustomAmount(event.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.customTopUpSubmit}
                    disabled={!billing?.paymentsEnabled || busyTopUpAmount !== null}
                    onClick={() => void handleTopUp()}
                  >
                    {busyTopUpAmount !== null ? t("common.loading") : t("billing.topUpWalletAction")}
                  </button>
                </div>
                <p className={styles.stripeNote}>
                  <LockClosedIcon className={styles.stripeLock} aria-hidden />
                  {t("billing.secureStripe")}
                </p>
              </section>
            ) : null}

            {expandedFlow === "subscription" ? (
              <section className={`${styles.panel} ${styles.expandedPanel}`}>
                <div className={styles.panelHeader}>
                  <h2>{t("billing.subscriptionFlowTitle")}</h2>
                  <p>{t("billing.subscriptionFlowSubtitle")}</p>
                </div>
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
                <p className={styles.planDisclaimer}>{t("billing.subscriptionRenewalNote")}</p>
              </section>
            ) : null}
        </section>

        {billing && !billing.paymentsEnabled ? (
          <div className={styles.notice}>{billing.message || t("billing.paymentsDisabledNotice")}</div>
        ) : null}

        <section className={styles.transactionsPanel}>
          <div className={styles.transactionsHeader}>
            <div>
              <h2>{t("billing.transactionHistory")}</h2>
              <p>{t("billing.transactionHistoryIntro")}</p>
            </div>
            {transactions.length > TRANSACTION_PREVIEW_COUNT ? (
              <button
                type="button"
                className={styles.viewAllLink}
                onClick={() => setShowAllTransactions((value) => !value)}
              >
                {showAllTransactions
                  ? t("billing.showLessTransactions")
                  : t("billing.viewAllTransactions")}
              </button>
            ) : null}
          </div>

          {visibleTransactions.length === 0 ? (
            <p className={styles.emptyTransactions}>{t("billing.noTransactions")}</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.transactionsTable}>
                <thead>
                  <tr>
                    <th>{t("billing.table.date")}</th>
                    <th>{t("billing.table.description")}</th>
                    <th>{t("billing.table.type")}</th>
                    <th>{t("billing.table.amount")}</th>
                    <th>{t("billing.table.balanceAfter")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatTransactionDate(transaction.createdAtUtc)}</td>
                      <td>{transaction.description || "—"}</td>
                      <td>
                        <span className={`${styles.typeBadge} ${getTransactionBadgeClass(transaction.type)}`}>
                          {getTransactionBadgeLabel(transaction.type)}
                        </span>
                      </td>
                      <td
                        className={
                          transaction.amount >= 0 ? styles.amountPositive : styles.amountNegative
                        }
                      >
                        {transaction.amount >= 0 ? "+" : "−"}
                        {formatMoney(Math.abs(transaction.amount))}
                      </td>
                      <td>{formatMoney(transaction.balanceAfter)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className={styles.pageStripeFooter}>
          <LockClosedIcon className={styles.pageStripeLock} aria-hidden />
          <span>{t("billing.stripeFooter")}</span>
          <strong>stripe</strong>
        </div>
      </main>
      {!isEmployerShell ? <Footer /> : null}
    </>
  );
};

export default UpgradePage;
