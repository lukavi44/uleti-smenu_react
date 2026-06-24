import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlatformStats } from "../../models/PlatformStats.model";
import { GetPlatformStats } from "../../services/platform-service";
import HeroStatCounter from "./HeroStatCounter";
import styles from "./HeroPlatformStats.module.scss";

type HeroPlatformStatsProps = {
  compact?: boolean;
};

const HeroPlatformStats = ({ compact = false }: HeroPlatformStatsProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await GetPlatformStats();
        setStats(response);
      } catch {
        setStats({ matchedCount: 0, employerCount: 0, employeeCount: 0 });
      }
    };

    void loadStats();
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || stats === null) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [stats]);

  if (stats === null) {
    return (
      <div className={styles.stats} aria-hidden="true">
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.stats} ${compact ? styles.statsCompact : ""}`}
      aria-live="polite"
    >
      <HeroStatCounter
        label={t("home.statsMatches")}
        value={stats.matchedCount}
        animate={animate}
        compact={compact}
      />
      <HeroStatCounter
        label={t("home.statsEmployers")}
        value={stats.employerCount}
        animate={animate}
        compact={compact}
      />
      <HeroStatCounter
        label={t("home.statsEmployees")}
        value={stats.employeeCount}
        animate={animate}
        compact={compact}
      />
    </div>
  );
};

export default HeroPlatformStats;
