import { EmployerSubscription } from "./Subscription.model";

export interface BillingPlan {
  id: string;
  title: string;
  description: string;
  cost: number;
  durationInDays: number;
  billingInterval: "month" | "year";
  currency: string;
}

export interface BillingOverview {
  subscription: EmployerSubscription;
  plans: BillingPlan[];
  paymentsEnabled: boolean;
  message: string;
}
