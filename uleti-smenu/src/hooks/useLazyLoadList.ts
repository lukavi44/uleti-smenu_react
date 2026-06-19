import { useCallback, useEffect, useMemo, useState } from "react";

export function useLazyLoadList<T>(items: T[], pageSize: number, resetKey = "") {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [resetKey, pageSize]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const totalCount = items.length;
  const hasMore = visibleCount < totalCount;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, items.length));
  }, [items.length, pageSize]);

  return {
    visibleItems,
    hasMore,
    loadMore,
    totalCount,
    visibleCount: Math.min(visibleCount, totalCount),
    pageSize,
  };
}
