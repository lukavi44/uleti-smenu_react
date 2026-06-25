import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotificationsMenu } from "../../hooks/useNotificationsMenu";
import styles from "./NotificationsMenu.module.scss";

type NotificationsMenuProps = {
  enabled?: boolean;
  trigger: (props: {
    onClick: () => void;
    unreadCount: number;
    isOpen: boolean;
  }) => ReactNode;
};

const formatNotificationDate = (value: string) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }
  return parsedDate.toLocaleString();
};

const NotificationsMenu = ({ enabled = true, trigger }: NotificationsMenuProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    isOpen,
    notifications,
    unreadCount,
    activeNotificationId,
    notificationOffsets,
    draggingNotificationId,
    removingNotificationIds,
    toggleOpen,
    close,
    handleMarkAsRead,
    handleDeleteNotification,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
  } = useNotificationsMenu(enabled);

  if (!enabled) {
    return null;
  }

  return (
    <div className={styles.wrapper} data-notifications-menu>
      {trigger({ onClick: toggleOpen, unreadCount, isOpen })}
      {isOpen ? (
        <div className={styles.panel}>
          <h4>{t("header.notifications")}</h4>
          {notifications.length === 0 ? (
            <p className={styles.muted}>{t("header.noNotifications")}</p>
          ) : null}
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.item} ${notification.isRead ? styles.itemRead : ""} ${
                removingNotificationIds.includes(notification.id) ? styles.itemRemoving : ""
              }`}
              style={{
                transform: `translateX(${notificationOffsets[notification.id] ?? 0}px)`,
                transition:
                  draggingNotificationId === notification.id ? "none" : "transform 0.18s ease-out",
              }}
              onPointerDown={(event) => handlePointerDown(notification.id, event)}
              onPointerMove={(event) => handlePointerMove(notification.id, event)}
              onPointerUp={() => void handlePointerEnd(notification.id)}
              onPointerCancel={() => void handlePointerEnd(notification.id)}
            >
              <div className={styles.itemHeader}>
                <p
                  className={notification.type === "ReviewReminder" ? styles.itemLink : undefined}
                  onClick={() => {
                    if (notification.type !== "ReviewReminder") {
                      return;
                    }

                    if (!notification.isRead) {
                      void handleMarkAsRead(notification.id);
                    }

                    close();
                    navigate("/profile");
                  }}
                >
                  {notification.message}
                </p>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => void handleDeleteNotification(notification.id)}
                  disabled={
                    activeNotificationId !== null || removingNotificationIds.includes(notification.id)
                  }
                  aria-label={t("header.deleteNotification")}
                  title={t("header.deleteNotification")}
                >
                  {activeNotificationId === notification.id ? "..." : "✕"}
                </button>
              </div>
              <small>{formatNotificationDate(notification.createdAtUtc)}</small>
              {!notification.isRead ? (
                <button
                  type="button"
                  onClick={() => void handleMarkAsRead(notification.id)}
                  disabled={
                    activeNotificationId !== null || removingNotificationIds.includes(notification.id)
                  }
                >
                  {activeNotificationId === notification.id
                    ? t("header.marking")
                    : t("header.markAsRead")}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default NotificationsMenu;
