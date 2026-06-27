export interface EmployerDashboardSummary {
    activeJobPostsCount: number;
    pendingApplicantsCount: number;
    activePostsByLocationId: Record<string, number>;
}
