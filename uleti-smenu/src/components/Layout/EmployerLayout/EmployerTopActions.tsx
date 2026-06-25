import { Link } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../store/Auth-context";
import { Employer } from "../../../models/User.model";
import { getImageUrl } from "../../../helpers/getHelperUrl";
import NotificationsMenu from "../../Notifications/NotificationsMenu";
import styles from "./EmployerTopActions.module.scss";

const EmployerTopActions = () => {
  const { t } = useTranslation();
  const { me } = useContext(AuthContext);
  const employer = me && "name" in me ? (me as Employer) : null;

  return (
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

      <Link to="/profile" className={styles.avatarLink} aria-label={t("nav.profile")}>
        <img src={getImageUrl(employer?.profilePhoto)} alt="" className={styles.avatar} />
      </Link>
    </div>
  );
};

export default EmployerTopActions;
