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
  phoneNumber: string;
  city?: string;
  isFavourite?: boolean;
  locations: RestaurantLocation[];
  reviewSummary: ReviewSummary;
  activeJobPosts: EmployerJobPostSummary[];
}
