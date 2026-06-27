import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  PlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import styles from "./EmployerDashboardSummaryCards.module.scss";

type EmployerDashboardSummaryCardsProps = {
  activeJobPostsCount: number;
  pendingApplicantsCount: number;
  unreadMessagesCount: number;
};

const EmployerDashboardSummaryCards = ({
  activeJobPostsCount,
  pendingApplicantsCount,
  unreadMessagesCount,
}: EmployerDashboardSummaryCardsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreatePost = () => {
    navigate("/oglasi-za-posao", { state: { openCreateForm: true } });
  };

  const handleOpenMessages = () => {
    navigate("/messages");
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
          <p className={styles.label}>{t("home.dashboard.pendingApplicants")}</p>
          <p className={styles.value}>{pendingApplicantsCount}</p>
          {pendingApplicantsCount > 0 ? (
            <p className={styles.hint}>{t("home.dashboard.pendingApplicantsHint")}</p>
          ) : null}
        </div>
      </article>

      <button
        type="button"
        className={`${styles.card} ${styles.cardAmber} ${styles.clickableCard}`}
        onClick={handleOpenMessages}
      >
        <div className={`${styles.iconWrap} ${styles.iconAmber}`}>
          <ChatBubbleLeftRightIcon className={styles.icon} aria-hidden />
        </div>
        <div className={styles.content}>
          <p className={styles.label}>{t("home.dashboard.unreadMessages")}</p>
          <p className={styles.value}>{unreadMessagesCount}</p>
          {unreadMessagesCount > 0 ? (
            <p className={styles.hint}>{t("home.dashboard.viewMessages")}</p>
          ) : null}
        </div>
      </button>

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
