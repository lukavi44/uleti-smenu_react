export type SubscriptionStatus = "Trial" | "Active" | "Expired" | "None";

export interface EmployerSubscription {
  status: SubscriptionStatus;
  planTitle: string;
  subscriptionStart?: string;
  subscriptionStop?: string;
  daysRemaining: number;
  isActive: boolean;
}
