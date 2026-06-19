import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./LazyLoadSentinel.module.scss";

interface LazyLoadSentinelProps {
  hasMore: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
  visibleCount?: number;
  totalCount?: number;
  className?: string;
}

const LazyLoadSentinel = ({
  hasMore,
  isLoading = false,
  onLoadMore,
  visibleCount,
  totalCount,
  className,
}: LazyLoadSentinelProps) => {
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore && !isLoading) {
    if (visibleCount !== undefined && totalCount !== undefined && totalCount > 0) {
      return (
        <p className={`${styles.status} ${className ?? ""}`}>
          {t("common.loadedOf", { visible: visibleCount, total: totalCount })}
        </p>
      );
    }

    return null;
  }

  return (
    <div ref={sentinelRef} className={`${styles.sentinel} ${className ?? ""}`}>
      {isLoading && <span className={styles.loading}>{t("common.loadingMore")}</span>}
    </div>
  );
};

export default LazyLoadSentinel;
