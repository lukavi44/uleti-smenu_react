import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./AdminListPage.module.scss";

export type AdminListColumn<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
};

type AdminListPageProps<T> = {
  searchPlaceholder: string;
  emptyMessage: string;
  columns: AdminListColumn<T>[];
  renderMobileCard: (item: T) => ReactNode;
  fetchItems: (params: {
    search: string;
    status: string;
    city: string;
    page: number;
    pageSize: number;
  }) => Promise<{ items: T[]; totalCount: number }>;
  showStatusFilter?: boolean;
  statusOptions?: { value: string; label: string }[];
  showCityFilter?: boolean;
};

const PAGE_SIZE = 10;

const AdminListPage = <T extends { id: string }>({
  searchPlaceholder,
  emptyMessage,
  columns,
  renderMobileCard,
  fetchItems,
  showStatusFilter = false,
  statusOptions = [],
  showCityFilter = false,
}: AdminListPageProps<T>) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchItems({
          search,
          status,
          city,
          page,
          pageSize: PAGE_SIZE,
        });
        setItems(response.items);
        setTotalCount(response.totalCount);
      } catch {
        setItems([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [search, status, city, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        {showStatusFilter ? (
          <select
            className={styles.selectInput}
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}
        {showCityFilter ? (
          <input
            type="search"
            className={styles.selectInput}
            placeholder={t("admin.employers.allCities")}
            value={city}
            onChange={(event) => {
              setPage(1);
              setCity(event.target.value);
            }}
          />
        ) : null}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cards}>
        {items.map((item) => (
          <article key={item.id} className={styles.card}>
            {renderMobileCard(item)}
          </article>
        ))}
      </div>

      {!loading && items.length === 0 ? <p className={styles.emptyState}>{emptyMessage}</p> : null}

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageButton}
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          {t("jobPosts.previousPage")}
        </button>
        <span className={styles.pageInfo}>{t("jobPosts.pageOf", { page, totalPages })}</span>
        <button
          type="button"
          className={styles.pageButton}
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          {t("jobPosts.nextPage")}
        </button>
      </div>
    </div>
  );
};

export default AdminListPage;
