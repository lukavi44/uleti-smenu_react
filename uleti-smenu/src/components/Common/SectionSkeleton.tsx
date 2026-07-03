import styles from "./SectionSkeleton.module.scss";

interface SectionSkeletonProps {
  rows?: number;
}

const SectionSkeleton = ({ rows = 3 }: SectionSkeletonProps) => (
  <div className={styles.list} aria-hidden="true">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className={styles.card} />
    ))}
  </div>
);

export default SectionSkeleton;
