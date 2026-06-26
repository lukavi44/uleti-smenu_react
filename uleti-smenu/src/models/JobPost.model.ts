import { Employer } from "./User.model"

export interface RecentApplicantPreview {
    userId: string;
    profilePhoto?: string;
    firstName: string;
    lastName: string;
}

export interface JobPost {
    id: string,
    title: string,
    description: string,
    position: string,
    status: string,
    salary: number,
    startingDate: Date,
    visibleUntil: Date,
    employerId: string,
    restaurantLocationId?: string,
    restaurantLocationName?: string,
    restaurantLocationCity?: string,
    isArchived?: boolean,
    applicantCount?: number,
    recentApplicants?: RecentApplicantPreview[],
    employer: Employer
}