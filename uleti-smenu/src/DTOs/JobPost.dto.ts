export interface JobPostDTO {
    title: string,
    description: string,
    position: string,
    status: string,
    salary: number,
    startingDate: Date,
    visibleUntil?: Date,
    restaurantLocationId: string
}
