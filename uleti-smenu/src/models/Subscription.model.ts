export type SubscriptionStatus =
  | "Trialing"
  | "Active"
  | "PastDue"
  | "Canceled"
  | "Expired"
  | "Incomplete"
  | "None";

export interface EmployerSubscription {
  status: SubscriptionStatus;
  planTitle: string;
  planKind?: string;
  subscriptionStart?: string;
  subscriptionStop?: string;
  gracePeriodEndsAtUtc?: string;
  daysRemaining: number;
  postCredits?: number;
  maxActivePosts?: number;
  isActive: boolean;
  canPost?: boolean;
  needsAttention?: boolean;
  canManageBilling?: boolean;
}
