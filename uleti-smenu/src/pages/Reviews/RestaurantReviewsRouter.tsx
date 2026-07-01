import { useContext } from "react";
import { useParams } from "react-router-dom";
import ReviewSubjectPage from "./ReviewSubjectPage";
import EmployerRestaurantReviewsPage from "./EmployerRestaurantReviewsPage";
import { AuthContext } from "../../store/Auth-context";

const RestaurantReviewsRouter = () => {
  const { slug } = useParams<{ slug: string }>();
  const { authStatus, role, me } = useContext(AuthContext);

  const ownSlug =
    me && "publicSlug" in me ? String(me.publicSlug ?? "").trim().toLowerCase() : "";
  const isOwnRestaurant =
    authStatus === "authenticated" &&
    role === "Employer" &&
    Boolean(slug) &&
    ownSlug.length > 0 &&
    slug!.trim().toLowerCase() === ownSlug;

  if (isOwnRestaurant) {
    return <EmployerRestaurantReviewsPage />;
  }

  return <ReviewSubjectPage subjectType="employer" />;
};

export default RestaurantReviewsRouter;
