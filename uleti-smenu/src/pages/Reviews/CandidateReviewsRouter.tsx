import { useContext } from "react";
import ReviewSubjectPage from "./ReviewSubjectPage";
import EmployerCandidateReviewsPage from "./EmployerCandidateReviewsPage";
import { AuthContext } from "../../store/Auth-context";

const CandidateReviewsRouter = () => {
  const { authStatus, role } = useContext(AuthContext);

  if (authStatus === "authenticated" && role === "Employer") {
    return <EmployerCandidateReviewsPage />;
  }

  return <ReviewSubjectPage subjectType="employee" />;
};

export default CandidateReviewsRouter;
