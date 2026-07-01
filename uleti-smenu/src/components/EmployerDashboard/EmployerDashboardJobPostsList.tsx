import EmployerJobPostsTabbedList from "../JobPosts/EmployerJobPostsTabbedList";
import { JobPost } from "../../models/JobPost.model";

type EmployerDashboardJobPostsListProps = {
  jobPosts: JobPost[];
  isLoading: boolean;
  onManagePost: (post: JobPost) => void;
};

const EmployerDashboardJobPostsList = ({
  jobPosts,
  isLoading,
  onManagePost,
}: EmployerDashboardJobPostsListProps) => (
  <EmployerJobPostsTabbedList
    jobPosts={jobPosts}
    isLoading={isLoading}
    onManagePost={onManagePost}
    limit={5}
    showFooterLink
    variant="row"
  />
);

export default EmployerDashboardJobPostsList;
