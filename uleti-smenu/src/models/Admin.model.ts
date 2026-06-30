export type AdminEmployerStatus = "Active" | "Suspended";

export type AdminRecentActivityType =
  | "EmployerRegistered"
  | "JobPostCreated"
  | "CandidateAccepted"
  | "WalletTopUp"
  | "ReportSubmitted";

export interface AdminDashboardChartPoint {
  date: string;
  count: number;
}

export interface AdminRecentActivity {
  type: AdminRecentActivityType;
  title: string;
  subtitle?: string;
  occurredAtUtc: string;
  relatedEntityId?: string;
}

export interface AdminDashboard {
  totalCandidates: number;
  totalEmployers: number;
  activeJobPosts: number;
  reportsCount: number;
  walletTopUpsThisMonth: number;
  acceptedCandidatesAllTime: number;
  completedShiftsAllTime: number;
  applicationsChart: AdminDashboardChartPoint[];
  recentActivities: AdminRecentActivity[];
}

export interface AdminEmployerListItem {
  id: string;
  name: string;
  email: string;
  pib: string;
  city: string;
  status: AdminEmployerStatus;
  isVerifiedEmployer: boolean;
  createdAtUtc?: string;
  profilePhoto?: string;
}

export interface AdminEmployerListResponse {
  items: AdminEmployerListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminPagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminCandidateListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city?: string;
  profilePhoto?: string;
  applicationsCount: number;
}

export interface AdminRestaurantListItem {
  id: string;
  employerId: string;
  employerName: string;
  name: string;
  city: string;
  phoneNumber: string;
}

export interface AdminJobPostListItem {
  id: string;
  title: string;
  position: string;
  employerName: string;
  locationName?: string;
  status: string;
  applicationsCount: number;
  createdAtUtc: string;
}

export interface AdminApplicationListItem {
  id: string;
  candidateName: string;
  jobTitle: string;
  employerName: string;
  status: string;
  appliedAtUtc: string;
}

export interface AdminBillingListItem {
  id: string;
  employerName: string;
  amount: number;
  type: string;
  description?: string;
  createdAtUtc: string;
}

export interface AdminEmployerDetail {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePhoto?: string;
  pib: string;
  mb: string;
  streetName: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  country: string;
  region: string;
  status: AdminEmployerStatus;
  isVerifiedEmployer: boolean;
  verifiedAtUtc?: string;
  verifiedByLabel?: string;
  billingStatus: string;
  subscriptionPlanName?: string;
  subscriptionStop?: string;
  walletBalance: number;
  activeJobPostsCount: number;
  totalJobPostsCount: number;
  completedShiftsCount: number;
  acceptedCandidatesAllTime: number;
  averageRating?: number;
  reviewCount: number;
  createdAtUtc?: string;
}
