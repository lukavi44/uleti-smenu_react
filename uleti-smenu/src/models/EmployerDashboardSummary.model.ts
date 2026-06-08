export interface EmployerDashboardSummary {
    activeJobPostsCount: number;
    totalApplicantsCount: number;
    activePostsByLocationId: Record<string, number>;
}
