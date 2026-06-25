export type SubscriptionStatus =
  | "Trialing"
  | "Active"
  | "PastDue"
  | "Canceled"
  | "Expired"
  | "Incomplete"
  | "None";

export type PostingChargeSource =
  | "FreeCredit"
  | "UnlimitedSubscription"
  | "BasicSubscription"
  | "Wallet";

export interface EmployerSubscription {
  status: SubscriptionStatus;
  planTitle: string;
  planKind?: string;
  subscriptionStart?: string;
  subscriptionStop?: string;
  gracePeriodEndsAtUtc?: string;
  daysRemaining: number;
  freePostingCredits?: number;
  postCredits?: number;
  walletBalance?: number;
  currency?: string;
  jobPostPrice?: number;
  activeJobPostsCount?: number;
  maxActivePosts?: number;
  nextPostingChargeSource?: PostingChargeSource;
  isActive: boolean;
  canPost?: boolean;
  needsAttention?: boolean;
  canManageBilling?: boolean;
}
