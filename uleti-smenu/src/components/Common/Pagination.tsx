import { useTranslation } from "react-i18next";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

const Pagination = ({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPrevious,
  onNext,
  className,
}: PaginationProps) => {
  const { t } = useTranslation();

  if (totalCount <= pageSize) {
    return null;
  }

  return (
    <div className={`${styles.paginationRow} ${className ?? ""}`}>
      <p className={styles.paginationInfo}>
        {t("profile.pageOf", { page, totalPages })}
      </p>
      <div className={styles.paginationActions}>
        <button
          type="button"
          className={styles.paginationButton}
          disabled={page <= 1}
          onClick={onPrevious}
        >
          {t("profile.previousPage")}
        </button>
        <button
          type="button"
          className={styles.paginationButton}
          disabled={page >= totalPages}
          onClick={onNext}
        >
          {t("profile.nextPage")}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
