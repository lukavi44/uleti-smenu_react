import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  BanknotesIcon,
  CheckCircleIcon,
  CreditCardIcon,
  DocumentTextIcon,
  GiftIcon,
  LockClosedIcon,
  PencilSquareIcon,
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
import styles from "./UpgradePage.module.scss";

const billingReturnBase = () => `${window.location.origin}/billing/upgrade`;

const TRANSACTION_LIMIT = 20;

const UpgradePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { role, me, authStatus } = useContext(AuthContext);
  const isEmployerShell = useIsEmployerShell();
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [busyTopUpAmount, setBusyTopUpAmount] = useState<number | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showCustomTopUp, setShowCustomTopUp] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const loadBilling = async () => {
    try {
      const [billingResponse, transactionsResponse] = await Promise.all([
        GetMyBilling(),
        GetWalletTransactions(TRANSACTION_LIMIT),
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

  const handleTopUp = async (amount: number) => {
    if (!billing?.paymentsEnabled) {
      toast.info(t("billing.paymentsComingSoon"));
      return;
    }

    if (amount <= 0) {
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

  const handleCustomTopUp = () => {
    const parsed = Number(customAmount.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error(t("billing.invalidTopUpAmount"));
      return;
    }
    setShowCustomTopUp(false);
    void handleTopUp(parsed);
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
  const topUpAmounts = billing?.suggestedTopUpAmounts ?? [500, 1000, 2000];
  const registrationTotal = billing?.registrationFreeCredits ?? 5;
  const freeCreditsRemaining =
    subscription?.freePostingCredits ?? subscription?.postCredits ?? 0;
  const walletBalance = subscription?.walletBalance ?? 0;
  const activePosts = subscription?.activeJobPostsCount ?? 0;
  const maxActivePosts = subscription?.maxActivePosts ?? 0;
  const hasPostLimit = maxActivePosts > 0 && maxActivePosts < 1000;

  const formatMoney = (value: number, compact = false) => {
    const formatted = value.toLocaleString("sr-RS");
    return compact ? `${formatted} ${currency}` : `${formatted} ${currency}`;
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const isActivePlan = (plan: BillingPlan) => {
    if (!subscription?.planTitle) return false;
    if (subscription.status !== "Active" && subscription.status !== "Canceled") return false;
    return (
      plan.title.toLowerCase() === subscription.planTitle.toLowerCase() ||
      plan.planKind.toLowerCase() === (subscription.planKind ?? "").toLowerCase()
    );
  };

  const subscriptionLabel = useMemo(() => {
    if (subscription?.status === "Active" && subscription.planTitle) {
      return subscription.planTitle;
    }
    if (subscription?.status === "Canceled" && subscription.planTitle) {
      return subscription.planTitle;
    }
    return t("billing.noSubscription");
  }, [subscription, t]);

  const subscriptionValidUntil = subscription?.subscriptionStop
    ? new Date(subscription.subscriptionStop).toLocaleDateString("sr-RS")
    : null;

  const visibleTransactions = showAllTransactions ? transactions : transactions.slice(0, 5);

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

  const getPlanFeatures = (planKind: string) => {
    const key = planKind.toLowerCase();
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
            title={t("billing.upgradeTitle")}
            subtitle={t("billing.upgradeIntro")}
          />
        ) : (
          <>
            <Link className={styles.backLink} to="/profile">
              {t("billing.backToProfile")}
            </Link>
            <h1 className={styles.pageTitle}>{t("billing.upgradeTitle")}</h1>
            <p className={styles.intro}>{t("billing.upgradeIntro")}</p>
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

        <section className={styles.paymentIntro}>
          <h2>{t("billing.paymentChoiceTitle")}</h2>
          <p>{t("billing.paymentChoiceIntro")}</p>
        </section>

        <div className={styles.mainGrid}>
          <section className={`${styles.panel} ${styles.paymentPathCard}`}>
            <header className={styles.panelHeader}>
              <h2>{t("billing.payPerPostTitle")}</h2>
              <p>{t("billing.payPerPostIntro")}</p>
            </header>
            <p className={styles.walletBalanceLarge}>{formatMoney(walletBalance)}</p>
            <div className={styles.topUpGrid}>
              {topUpAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={styles.topUpChip}
                  disabled={!billing?.paymentsEnabled || busyTopUpAmount === amount}
                  onClick={() => void handleTopUp(amount)}
                >
                  {busyTopUpAmount === amount
                    ? t("common.loading")
                    : `+ ${formatMoney(amount, true)}`}
                </button>
              ))}
              <button
                type="button"
                className={`${styles.topUpChip} ${styles.topUpChipCustom}`}
                disabled={!billing?.paymentsEnabled}
                onClick={() => setShowCustomTopUp((value) => !value)}
              >
                <PencilSquareIcon className={styles.topUpChipIcon} aria-hidden />
                {t("billing.customAmount")}
              </button>
            </div>
            {showCustomTopUp && (
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
                  disabled={!billing?.paymentsEnabled}
                  onClick={handleCustomTopUp}
                >
                  {t("billing.topUpWalletShort")}
                </button>
              </div>
            )}
            <footer className={styles.stripeNote}>
              <LockClosedIcon className={styles.stripeLock} aria-hidden />
              <span>{t("billing.secureStripe")}</span>
            </footer>
          </section>

          <section className={`${styles.panel} ${styles.paymentPathCard}`}>
            <header className={styles.panelHeader}>
              <h2>{t("billing.subscriptionPathTitle")}</h2>
              <p>{t("billing.subscriptionPathIntro")}</p>
            </header>
            <div className={styles.planStack}>
              {(billing?.plans ?? []).map((plan) => {
                const isCurrent = isActivePlan(plan);
                const features = getPlanFeatures(plan.planKind);
                return (
                  <article
                    key={plan.id}
                    className={`${styles.planOption} ${isCurrent ? styles.planOptionActive : ""}`}
                  >
                    <div className={styles.planOptionHead}>
                      <div className={styles.planRadio} aria-hidden>
                        <span className={isCurrent ? styles.planRadioChecked : ""} />
                      </div>
                      <div>
                        <h3>{plan.title}</h3>
                        <p className={styles.planPrice}>
                          {plan.cost.toLocaleString("sr-RS")} {plan.currency}
                          <span> / {t("billing.perMonth")}</span>
                        </p>
                      </div>
                    </div>
                    <ul className={styles.planFeatures}>
                      {features.map((feature) => (
                        <li key={feature}>
                          <CheckCircleIcon className={styles.featureIcon} aria-hidden />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={isCurrent ? styles.planBtnCurrent : styles.planBtnSelect}
                      disabled={
                        isCurrent || !billing?.paymentsEnabled || busyPlanId === plan.id
                      }
                      onClick={() => void handleSubscribe(plan)}
                    >
                      {isCurrent
                        ? t("billing.currentPlan")
                        : busyPlanId === plan.id
                          ? t("common.loading")
                          : t("billing.selectPlan")}
                    </button>
                  </article>
                );
              })}
            </div>
            {(billing?.plans.length ?? 0) === 0 && (
              <p className={styles.mutedText}>{t("billing.noPlans")}</p>
            )}
            <p className={styles.planDisclaimer}>{t("billing.planDisclaimer")}</p>
          </section>
        </div>

        <section className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <div className={styles.summaryCardHead}>
              <GiftIcon className={styles.summaryIcon} aria-hidden />
              <span>{t("billing.freeCredits")}</span>
            </div>
            <p className={styles.summaryValue}>
              {t("billing.creditsOfTotal", {
                remaining: freeCreditsRemaining,
                total: registrationTotal,
              })}
            </p>
            <p className={styles.summaryHint}>{t("billing.creditsNeverExpire")}</p>
            <div className={styles.progressTrack}>
              <div
                className={`${styles.progressFill} ${styles.progressGreen}`}
                style={{
                  width: `${registrationTotal > 0 ? Math.min(100, (freeCreditsRemaining / registrationTotal) * 100) : 0}%`,
                }}
              />
            </div>
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.summaryCardHead}>
              <BanknotesIcon className={styles.summaryIcon} aria-hidden />
              <span>{t("billing.walletBalance")}</span>
            </div>
            <p className={styles.summaryValue}>{formatMoney(walletBalance)}</p>
            <p className={styles.summaryHint}>{t("billing.walletAvailable")}</p>
            <button
              type="button"
              className={styles.summaryAction}
              disabled={!billing?.paymentsEnabled || busyTopUpAmount !== null}
              onClick={() => void handleTopUp(topUpAmounts[0] ?? 500)}
            >
              {t("billing.topUpWalletShort")}
            </button>
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.summaryCardHead}>
              <CreditCardIcon className={styles.summaryIcon} aria-hidden />
              <span>{t("billing.currentSubscription")}</span>
            </div>
            <p className={styles.summaryValue}>{subscriptionLabel}</p>
            <p className={styles.summaryHint}>
              {subscriptionValidUntil
                ? t("billing.validUntil", { date: subscriptionValidUntil })
                : t("billing.noActiveSubscription")}
            </p>
            {subscription?.canManageBilling && (
              <button
                type="button"
                className={styles.summaryActionLink}
                disabled={portalLoading}
                onClick={() => void handleManageBilling()}
              >
                {portalLoading ? t("common.loading") : t("billing.manageSubscriptionShort")}
              </button>
            )}
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.summaryCardHead}>
              <DocumentTextIcon className={styles.summaryIcon} aria-hidden />
              <span>{t("billing.activePosts")}</span>
            </div>
            <p className={styles.summaryValue}>
              {hasPostLimit ? `${activePosts} / ${maxActivePosts}` : activePosts}
            </p>
            <p className={styles.summaryHint}>
              {hasPostLimit
                ? t("billing.activePostsHint", { active: activePosts, max: maxActivePosts })
                : t("billing.activePostsUnlimited")}
            </p>
            {hasPostLimit && (
              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${styles.progressOrange}`}
                  style={{
                    width: `${Math.min(100, (activePosts / maxActivePosts) * 100)}%`,
                  }}
                />
              </div>
            )}
          </article>
        </section>

        <section className={styles.transactionsPanel}>
          <header className={styles.transactionsHeader}>
            <div>
              <h2>{t("billing.transactionHistory")}</h2>
              <p>{t("billing.transactionHistoryIntro")}</p>
            </div>
            {transactions.length > 5 && (
              <button
                type="button"
                className={styles.viewAllLink}
                onClick={() => setShowAllTransactions((value) => !value)}
              >
                {showAllTransactions
                  ? t("billing.showLessTransactions")
                  : t("billing.viewAllTransactions")}
              </button>
            )}
          </header>

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
                      <td>{formatDate(transaction.createdAtUtc)}</td>
                      <td>{transaction.description ?? "—"}</td>
                      <td>
                        <span
                          className={`${styles.typeBadge} ${getTransactionBadgeClass(transaction.type)}`}
                        >
                          {t(`billing.transactionBadge.${transaction.type}`, {
                            defaultValue: transaction.type,
                          })}
                        </span>
                      </td>
                      <td
                        className={
                          transaction.amount >= 0 ? styles.amountPositive : styles.amountNegative
                        }
                      >
                        {transaction.amount >= 0 ? "+" : ""}
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

        <footer className={styles.pageStripeFooter}>
          <LockClosedIcon className={styles.pageStripeLock} aria-hidden />
          <span>{t("billing.stripeFooter")}</span>
          <strong>stripe</strong>
        </footer>
      </main>
      {!isEmployerShell ? <Footer /> : null}
    </>
  );
};

export default UpgradePage;
