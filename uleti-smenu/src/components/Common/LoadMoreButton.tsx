import { useTranslation } from "react-i18next";
import styles from "./LoadMoreButton.module.scss";

interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
  className?: string;
}

const LoadMoreButton = ({
  hasMore,
  isLoading = false,
  onLoadMore,
  className,
}: LoadMoreButtonProps) => {
  const { t } = useTranslation();

  if (!hasMore) {
    return null;
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${className ?? ""}`}
      onClick={onLoadMore}
      disabled={isLoading}
    >
      {isLoading ? t("common.loadingMore") : t("employeeProfile.showMoreItems")}
    </button>
  );
};

export default LoadMoreButton;
