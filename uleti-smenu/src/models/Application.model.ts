export interface Applicant {
  applicationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePhoto?: string;
  status: string;
  appliedAt: string;
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
