import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  PlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import styles from "./EmployerDashboardSummaryCards.module.scss";

type EmployerDashboardSummaryCardsProps = {
  activeJobPostsCount: number;
  totalApplicantsCount: number;
  locations: RestaurantLocation[];
};

const EmployerDashboardSummaryCards = ({
  activeJobPostsCount,
  totalApplicantsCount,
  locations,
}: EmployerDashboardSummaryCardsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const branchNames = locations
    .map((location) => location.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

  const handleCreatePost = () => {
    navigate("/oglasi-za-posao", { state: { openCreateForm: true } });
  };

  return (
    <div className={styles.grid}>
      <article className={`${styles.card} ${styles.cardBlue}`}>
        <div className={`${styles.iconWrap} ${styles.iconBlue}`}>
          <DocumentTextIcon className={styles.icon} aria-hidden />
        </div>
        <div className={styles.content}>
          <p className={styles.label}>{t("home.activeJobPosts")}</p>
          <p className={styles.value}>{activeJobPostsCount}</p>
        </div>
      </article>

      <article className={`${styles.card} ${styles.cardGreen}`}>
        <div className={`${styles.iconWrap} ${styles.iconGreen}`}>
          <UsersIcon className={styles.icon} aria-hidden />
        </div>
        <div className={styles.content}>
          <p className={styles.label}>{t("home.totalApplicants")}</p>
          <p className={styles.value}>{totalApplicantsCount}</p>
        </div>
      </article>

      <article className={`${styles.card} ${styles.cardPurple}`}>
        <div className={`${styles.iconWrap} ${styles.iconPurple}`}>
          <BuildingStorefrontIcon className={styles.icon} aria-hidden />
        </div>
        <div className={styles.content}>
          <p className={styles.label}>{t("home.branches")}</p>
          <p className={styles.value}>{locations.length}</p>
          {branchNames ? <p className={styles.hint}>{branchNames}</p> : null}
        </div>
      </article>

      <article className={`${styles.card} ${styles.ctaCard}`}>
        <div className={styles.ctaIllustration} aria-hidden>
          <MegaphoneIcon className={styles.ctaIcon} />
        </div>
        <div className={styles.ctaContent}>
          <p className={styles.ctaTitle}>{t("home.dashboard.createPostTitle")}</p>
          <p className={styles.ctaSubtitle}>{t("home.dashboard.createPostSubtitle")}</p>
          <button type="button" className={styles.ctaButton} onClick={handleCreatePost}>
            <PlusIcon className={styles.ctaButtonIcon} aria-hidden />
            {t("jobPosts.createPost")}
          </button>
        </div>
      </article>
    </div>
  );
};

export default EmployerDashboardSummaryCards;
