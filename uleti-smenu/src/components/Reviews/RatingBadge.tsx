import { Link } from "react-router-dom";
import styles from "./RatingBadge.module.scss";

interface RatingBadgeProps {
  averageRating: number;
  reviewCount: number;
  compact?: boolean;
  subjectType?: "employee" | "employer";
  subjectId?: string;
  subjectSlug?: string;
}

const RatingBadge = ({
  averageRating,
  reviewCount,
  compact = false,
  subjectType,
  subjectId,
  subjectSlug,
}: RatingBadgeProps) => {
  if (reviewCount <= 0) {
    return null;
  }

  const className = `${styles.badge} ${compact ? styles.compact : ""}`;
  const content = (
    <>
      ★ {averageRating.toFixed(1)} ({reviewCount})
    </>
  );

  if (subjectType === "employer" && subjectSlug) {
    return (
      <Link
        to={`/restaurants/${subjectSlug}/reviews`}
        className={`${className} ${styles.link}`}
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </Link>
    );
  }

  if (subjectType && subjectId) {
    const to =
      subjectType === "employer"
        ? `/employers/${subjectId}/reviews`
        : `/employees/${subjectId}/reviews`;

    return (
      <Link
        to={to}
        className={`${className} ${styles.link}`}
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
};

export default RatingBadge;
