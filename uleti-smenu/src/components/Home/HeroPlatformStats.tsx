import { useEffect, useRef, useState } from "react";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PlatformStats } from "../../models/PlatformStats.model";
import { GetPlatformStats } from "../../services/platform-service";
import HeroStatCounter from "./HeroStatCounter";
import styles from "./HeroPlatformStats.module.scss";

type HeroPlatformStatsProps = {
  compact?: boolean;
  showIcons?: boolean;
};

const HeroPlatformStats = ({ compact = false, showIcons = false }: HeroPlatformStatsProps) => {
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

  const isLoading = stats === null;
  const iconProps = { "aria-hidden": true as const };

  return (
    <div
      ref={containerRef}
      className={`${styles.stats} ${compact ? styles.statsCompact : ""}`}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <HeroStatCounter
        label={t("home.statsMatches")}
        value={stats?.matchedCount ?? 0}
        icon={showIcons ? <CalendarDaysIcon {...iconProps} /> : undefined}
        animate={animate}
        compact={compact}
        loading={isLoading}
      />
      <HeroStatCounter
        label={t("home.statsEmployers")}
        value={stats?.employerCount ?? 0}
        icon={showIcons ? <BuildingStorefrontIcon {...iconProps} /> : undefined}
        animate={animate}
        compact={compact}
        loading={isLoading}
      />
      <HeroStatCounter
        label={t("home.statsEmployees")}
        value={stats?.employeeCount ?? 0}
        icon={showIcons ? <UsersIcon {...iconProps} /> : undefined}
        animate={animate}
        compact={compact}
        loading={isLoading}
      />
    </div>
  );
};

export default HeroPlatformStats;
