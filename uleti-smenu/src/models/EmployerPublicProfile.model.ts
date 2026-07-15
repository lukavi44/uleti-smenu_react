import { ReviewSummary } from "./Review.model";
import { RestaurantLocation } from "./RestaurantLocation.model";

export interface EmployerJobPostSummary {
  id: string;
  title: string;
  position: string;
  salary: number;
  startingDate: string;
  restaurantLocationName?: string;
  restaurantLocationCity?: string;
}

export interface EmployerPublicProfile {
  employerId: string;
  publicSlug: string;
  name: string;
  profilePhoto?: string;
  city?: string;
  isVerifiedEmployer: boolean;
  successfulHiresCount: number;
  isFavourite?: boolean;
  locations: RestaurantLocation[];
  reviewSummary: ReviewSummary;
  activeJobPosts: EmployerJobPostSummary[];
}
