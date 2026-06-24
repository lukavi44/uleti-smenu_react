import { useCountUp } from "../../hooks/useCountUp";
import styles from "./HeroStatCounter.module.scss";

type HeroStatCounterProps = {
  label: string;
  value: number;
  animate?: boolean;
  compact?: boolean;
};

const HeroStatCounter = ({ label, value, animate = true, compact = false }: HeroStatCounterProps) => {
  const displayValue = useCountUp(value, { enabled: animate });

  return (
    <article className={styles.stat}>
      <strong
        className={`${styles.value} ${compact ? styles.valueCompact : ""}`}
        aria-label={`${label}: ${value}`}
      >
        {displayValue.toLocaleString()}
      </strong>
      <span className={styles.label}>{label}</span>
    </article>
  );
};

export default HeroStatCounter;
