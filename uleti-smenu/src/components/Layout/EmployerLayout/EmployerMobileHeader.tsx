import { Link } from "react-router-dom";
import NotificationsMenu from "../../Notifications/NotificationsMenu";
import EmployerProfileMenu from "./EmployerProfileMenu";
import { BellIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/logo.png";
import styles from "./EmployerMobileHeader.module.scss";

const EmployerMobileHeader = () => {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logoLink}>
        <img src={logo} alt="UletiSmenu" className={styles.logo} />
      </Link>

      <div className={styles.actions}>
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
    </header>
  );
};

export default EmployerMobileHeader;
