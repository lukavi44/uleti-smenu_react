import { EmployerSubscription } from "./Subscription.model";

export interface BillingPlan {
  id: string;
  title: string;
  description: string;
  cost: number;
  durationInDays: number;
  creditsIncluded: number;
  billingInterval: "month" | "year" | "pack";
  planKind: string;
  checkoutMode: "subscription" | "payment";
  currency: string;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description?: string;
  createdAtUtc: string;
}

export interface BillingOverview {
  subscription: EmployerSubscription;
  plans: BillingPlan[];
  paymentsEnabled: boolean;
  suggestedTopUpAmounts: number[];
  registrationFreeCredits: number;
  message: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface PortalSessionResponse {
  portalUrl: string;
}
