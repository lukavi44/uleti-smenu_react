import { useCallback, useEffect, useRef, useState } from "react";

interface PagedFetchResult<T> {
  items: T[];
  totalCount: number;
}

interface Identifiable {
  id: string;
}

export function useServerLazyLoad<T extends Identifiable>(
  fetchPage: (page: number) => Promise<PagedFetchResult<T>>,
  resetKey: string
) {
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reset = useCallback(() => {
    setPage(1);
    setItems([]);
    setTotalCount(0);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    setPage(1);
    setItems([]);
    setTotalCount(0);
  }, [resetKey]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const isFirstPage = page === 1;
      if (isFirstPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await fetchPageRef.current(page);
        if (!active) {
          return;
        }

        setTotalCount(result.totalCount);
        setItems((previousItems) =>
          isFirstPage
            ? result.items
            : [
                ...previousItems,
                ...result.items.filter(
                  (item) => !previousItems.some((existing) => existing.id === item.id)
                ),
              ]
        );
      } finally {
        if (active) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [page, resetKey, reloadToken]);

  const hasMore = items.length < totalCount;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore) {
      return;
    }

    setPage((currentPage) => currentPage + 1);
  }, [hasMore, isLoading, isLoadingMore]);

  return {
    items,
    hasMore,
    loadMore,
    isLoading,
    isLoadingMore,
    totalCount,
    reset,
  };
}
