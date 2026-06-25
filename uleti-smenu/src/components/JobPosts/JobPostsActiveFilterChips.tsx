import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ActiveJobPostFilterChip } from "../../helpers/jobPostActiveFilters";
import styles from "./JobPostsActiveFilterChips.module.scss";

type JobPostsActiveFilterChipsProps = {
  chips: ActiveJobPostFilterChip[];
  onRemove: (chipId: string) => void;
  onClearAll: () => void;
};

const JobPostsActiveFilterChips = ({
  chips,
  onRemove,
  onClearAll,
}: JobPostsActiveFilterChipsProps) => {
  const { t } = useTranslation();

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.chips}>
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={styles.chip}
            onClick={() => onRemove(chip.id)}
          >
            <span>{chip.label}</span>
            <XMarkIcon className={styles.chipIcon} aria-hidden="true" />
            <span className={styles.srOnly}>{t("jobPosts.removeFilter")}</span>
          </button>
        ))}
      </div>
      <button type="button" className={styles.resetAll} onClick={onClearAll}>
        {t("jobPosts.resetAllFilters")}
      </button>
    </div>
  );
};

export default JobPostsActiveFilterChips;
