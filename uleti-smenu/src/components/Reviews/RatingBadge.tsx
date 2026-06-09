import styles from "./RatingBadge.module.scss";

interface RatingBadgeProps {
  averageRating: number;
  reviewCount: number;
  compact?: boolean;
}

const RatingBadge = ({ averageRating, reviewCount, compact = false }: RatingBadgeProps) => {
  if (reviewCount <= 0) {
    return null;
  }

  return (
    <span className={`${styles.badge} ${compact ? styles.compact : ""}`}>
      ★ {averageRating.toFixed(1)} ({reviewCount})
    </span>
  );
};

export default RatingBadge;
