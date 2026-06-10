import { Link } from "react-router-dom";
import styles from "./RatingBadge.module.scss";

interface RatingBadgeProps {
  averageRating: number;
  reviewCount: number;
  compact?: boolean;
  subjectType?: "employee" | "employer";
  subjectId?: string;
}

const RatingBadge = ({
  averageRating,
  reviewCount,
  compact = false,
  subjectType,
  subjectId,
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

  if (subjectType && subjectId) {
    const to =
      subjectType === "employer"
        ? `/employers/${subjectId}/reviews`
        : `/employees/${subjectId}/reviews`;

    return (
      <Link to={to} className={`${className} ${styles.link}`}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
};

export default RatingBadge;
