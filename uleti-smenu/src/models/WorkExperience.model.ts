import { Review, ReviewSummary } from "./Review.model";

export interface WorkExperience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface EmployeePlatformShift {
  applicationId: string;
  jobPostId: string;
  jobPostTitle: string;
  position: string;
  employerName: string;
  restaurantLocationName?: string;
  restaurantLocationCity?: string;
  startingDate: string;
  salary: number;
  completedAtUtc: string;
}

export interface EmployeePublicProfile {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePhoto?: string;
  workExperiences: WorkExperience[];
  platformShifts: EmployeePlatformShift[];
  reviewSummary: ReviewSummary;
  reviews: Review[];
}

export interface UpsertWorkExperiencePayload {
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
