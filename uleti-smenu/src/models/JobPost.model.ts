import { Employer } from "./User.model"

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
    employer: Employer
}