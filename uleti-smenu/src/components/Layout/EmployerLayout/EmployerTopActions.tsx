import { BellIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import NotificationsMenu from "../../Notifications/NotificationsMenu";
import EmployerProfileMenu from "./EmployerProfileMenu";
import shellStyles from "./EmployerLayout.module.scss";
import styles from "./EmployerTopActions.module.scss";

const EmployerTopActions = () => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.actions} ${shellStyles.desktopOnly}`}>
      <NotificationsMenu
        trigger={({ onClick, unreadCount, isOpen }) => (
          <button
            type="button"
            className={`${styles.iconButton} ${isOpen ? styles.iconButtonActive : ""}`}
            aria-label={t("header.notifications")}
            aria-expanded={isOpen}
            onClick={onClick}
          >
            <BellIcon className={styles.icon} />
            {unreadCount > 0 ? (
              <span className={styles.notificationBadge}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>
        )}
      />

      <EmployerProfileMenu />
    </div>
  );
};

export default EmployerTopActions;
