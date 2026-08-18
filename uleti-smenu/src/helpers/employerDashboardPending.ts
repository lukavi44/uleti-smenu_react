import { Applicant } from "../models/Application.model";
import { GetMyPendingDashboardApplicants } from "../services/application-service";

export type PendingApplicantItem = Applicant & {
  jobPostId: string;
  jobPostTitle: string;
  jobPostLocation: string;
};

const normalizePendingApplicant = (data: Record<string, unknown>): PendingApplicantItem => ({
  applicationId: String(data.applicationId ?? data.ApplicationId ?? ""),
  userId: String(data.userId ?? data.UserId ?? ""),
  firstName: String(data.firstName ?? data.FirstName ?? ""),
  lastName: String(data.lastName ?? data.LastName ?? ""),
  email: String(data.email ?? data.Email ?? ""),
  phoneNumber: String(data.phoneNumber ?? data.PhoneNumber ?? ""),
  profilePhoto: (data.profilePhoto ?? data.ProfilePhoto) as string | undefined,
  city: (data.city ?? data.City) as string | undefined,
  status: String(data.status ?? data.Status ?? ""),
  appliedAt: String(data.appliedAt ?? data.AppliedAt ?? ""),
  averageRating: Number(data.averageRating ?? data.AverageRating ?? 0),
  reviewCount: Number(data.reviewCount ?? data.ReviewCount ?? 0),
  jobPostId: String(data.jobPostId ?? data.JobPostId ?? ""),
  jobPostTitle: String(data.jobPostTitle ?? data.JobPostTitle ?? ""),
  jobPostLocation: String(data.jobPostLocation ?? data.JobPostLocation ?? "-"),
});

export const loadPendingApplicantsForDashboard = async (): Promise<PendingApplicantItem[]> => {
  const response = await GetMyPendingDashboardApplicants();
  return response.data.map((item) =>
    normalizePendingApplicant(item as unknown as Record<string, unknown>)
  );
};
