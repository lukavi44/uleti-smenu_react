export interface Applicant {
  applicationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePhoto?: string;
  city?: string;
  status: string;
  appliedAt: string;
  averageRating: number;
  reviewCount: number;
}

export interface EmployeeApplication {
  applicationId: string;
  jobPostId: string;
  jobPostTitle: string;
  position: string;
  employerName: string;
  restaurantLocationName?: string;
  restaurantLocationCity?: string;
  startingDate: string;
  salary: number;
  status: string;
  appliedAt: string;
}
