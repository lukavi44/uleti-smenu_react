import { ReactNode } from "react";
import { useCountUp } from "../../hooks/useCountUp";
import styles from "./HeroStatCounter.module.scss";

type HeroStatCounterProps = {
  label: string;
  value: number;
  icon?: ReactNode;
  animate?: boolean;
  compact?: boolean;
  loading?: boolean;
};

const HeroStatCounter = ({
  label,
  value,
  icon,
  animate = true,
  compact = false,
  loading = false,
}: HeroStatCounterProps) => {
  const displayValue = useCountUp(value, { enabled: animate && !loading });

  return (
    <article className={styles.stat}>
      {icon ? <span className={styles.iconWrap}>{icon}</span> : null}
      {loading ? (
        <div
          className={`${styles.valueSkeleton} ${compact ? styles.valueSkeletonCompact : ""}`}
          aria-hidden="true"
        />
      ) : (
        <strong
          className={`${styles.value} ${compact ? styles.valueCompact : ""}`}
          aria-label={`${label}: ${value}`}
        >
          {displayValue.toLocaleString()}
        </strong>
      )}
      <span className={styles.label}>{label}</span>
    </article>
  );
};

export default HeroStatCounter;
