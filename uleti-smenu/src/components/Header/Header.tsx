import styles from "./Header.module.scss";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { PointerEvent, useContext, useEffect, useState } from "react";

import "tailwindcss";

import logo from '../../assets/logo.png';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { AuthContext } from "../../store/Auth-context";
import ConfirmationDialog from "../Dialog/ConfirmationDialog";
import { DeleteNotification, GetMyNotifications, GetMyUnreadNotificationCount, MarkNotificationAsRead } from "../../services/notification-service";
import { GetMyUnreadChatCount } from "../../services/chat-service";
import {
    startRealtimeConnection,
    stopRealtimeConnection,
    subscribeChatUnreadCount,
    subscribeNotifications,
} from "../../services/realtime-service";
import { UserNotification } from "../../models/Notification.model";
import { handleNotificationNavigation, isNavigableNotification } from "../../helpers/notificationNavigation";
import { formatDisplayDateTime } from "../../helpers/formatDisplayDateTime";
import { useTranslation } from "react-i18next";

// import ProfileDialog from "../Dialogs/ProfileDialog";
// import { AuthContext } from "../../store/Auth-context";
// import ConfirmationDialog from "../Dialog/ConfirmationDialog";

const Header = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogoutModalOpened, setIsLogoutModalOpened] = useState(false);
    const { isLoggedIn, logout, role } = useContext(AuthContext);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);
    const [notificationOffsets, setNotificationOffsets] = useState<Record<string, number>>({});
    const [draggingNotificationId, setDraggingNotificationId] = useState<string | null>(null);
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const [removingNotificationIds, setRemovingNotificationIds] = useState<string[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const swipeDeleteThreshold = 90;
    const maxSwipeDistance = 140;
    const removeAnimationDurationMs = 240;

    const canUseChat = isLoggedIn && (role === "Employee" || role === "Employer");
    const canUseNotifications = canUseChat;

    const loadUnreadChatCount = async () => {
        if (!canUseChat) {
            setUnreadChatCount(0);
            return;
        }

        try {
            const response = await GetMyUnreadChatCount();
            setUnreadChatCount(response.data.count);
        } catch (error) {
            console.error("Failed to load unread chat count", error);
        }
    };

    const loadNotifications = async () => {
        if (!canUseNotifications) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        try {
            const [notificationsResponse, unreadCountResponse] = await Promise.all([
                GetMyNotifications(),
                GetMyUnreadNotificationCount()
            ]);

            setNotifications(notificationsResponse.data);
            setUnreadCount(unreadCountResponse.data.count);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    useEffect(() => {
        void loadNotifications();
    }, [canUseNotifications]);

    useEffect(() => {
        void loadUnreadChatCount();
    }, [canUseChat, location.pathname]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsNotificationsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!isMobileMenuOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    const openMobileMenu = () => {
        setIsNotificationsOpen(false);
        setIsMobileMenuOpen(true);
    };

    useEffect(() => {
        if (!isLoggedIn) {
            void stopRealtimeConnection();
            return;
        }

        void startRealtimeConnection();

        const unsubscribeChatUnread = subscribeChatUnreadCount((count) => {
            setUnreadChatCount(count);
        });

        const unsubscribeNotifications = subscribeNotifications((notification, count) => {
            setNotifications((previousNotifications) => {
                if (previousNotifications.some((item) => item.id === notification.id)) {
                    return previousNotifications;
                }

                return [notification, ...previousNotifications];
            });
            setUnreadCount(count);
        });

        return () => {
            unsubscribeChatUnread();
            unsubscribeNotifications();
        };
    }, [isLoggedIn]);

    const removeNotificationFromState = (notificationId: string, shouldDecreaseUnread: boolean) => {
        setNotifications((previousNotifications) =>
            previousNotifications.filter((notification) => notification.id !== notificationId)
        );

        if (shouldDecreaseUnread) {
            setUnreadCount((previousCount) => Math.max(0, previousCount - 1));
        }

        setRemovingNotificationIds((previousIds) => previousIds.filter((id) => id !== notificationId));
        setNotificationOffsets((previousOffsets) => {
            const updatedOffsets = { ...previousOffsets };
            delete updatedOffsets[notificationId];
            return updatedOffsets;
        });
    };

    const handleOnConfirm = async () => {
        await logout();
        setIsLogoutModalOpened(false);
        setIsNotificationsOpen(false);
    }

    const handleMarkAsRead = async (notificationId: string) => {
        setActiveNotificationId(notificationId);
        try {
            await MarkNotificationAsRead(notificationId);
            setNotifications((previousNotifications) =>
                previousNotifications.map((notification) =>
                    notification.id === notificationId ? { ...notification, isRead: true } : notification
                )
            );
            setUnreadCount((previousCount) => Math.max(0, previousCount - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        } finally {
            setActiveNotificationId(null);
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        if (removingNotificationIds.includes(notificationId)) {
            return;
        }

        setActiveNotificationId(notificationId);
        const deletedNotification = notifications.find((notification) => notification.id === notificationId);
        const shouldDecreaseUnread = Boolean(deletedNotification && !deletedNotification.isRead);
        const deleteRequest = DeleteNotification(notificationId);

        setRemovingNotificationIds((previousIds) => [...previousIds, notificationId]);

        // Keep a consistent fly-out direction for both X click and swipe delete.
        setNotificationOffsets((previousOffsets) => ({
            ...previousOffsets,
            [notificationId]: -maxSwipeDistance
        }));

        try {
            await Promise.all([
                deleteRequest,
                new Promise((resolve) => setTimeout(resolve, removeAnimationDurationMs))
            ]);

            removeNotificationFromState(notificationId, shouldDecreaseUnread);
        } catch (error) {
            console.error("Failed to delete notification", error);
            setRemovingNotificationIds((previousIds) => previousIds.filter((id) => id !== notificationId));
            setNotificationOffsets((previousOffsets) => ({
                ...previousOffsets,
                [notificationId]: 0
            }));
        } finally {
            setActiveNotificationId(null);
        }
    };

    const handlePointerDown = (notificationId: string, event: PointerEvent<HTMLDivElement>) => {
        if (removingNotificationIds.includes(notificationId)) {
            return;
        }

        const targetElement = event.target as HTMLElement;
        if (targetElement.closest("button")) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        setDraggingNotificationId(notificationId);
        setDragStartX(event.clientX);
    };

    const handlePointerMove = (notificationId: string, event: PointerEvent<HTMLDivElement>) => {
        if (draggingNotificationId !== notificationId || dragStartX === null) {
            return;
        }

        const deltaX = event.clientX - dragStartX;
        const clampedLeftSwipe = Math.max(-maxSwipeDistance, Math.min(0, deltaX));

        setNotificationOffsets((previousOffsets) => ({
            ...previousOffsets,
            [notificationId]: clampedLeftSwipe
        }));
    };

    const handlePointerEnd = async (notificationId: string) => {
        const currentOffset = notificationOffsets[notificationId] ?? 0;
        setDraggingNotificationId(null);
        setDragStartX(null);

        if (currentOffset <= -swipeDeleteThreshold) {
            await handleDeleteNotification(notificationId);
            return;
        }

        setNotificationOffsets((previousOffsets) => ({
            ...previousOffsets,
            [notificationId]: 0
        }));
    };

    const formatNotificationDate = (value: string) => {
        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }
        return formatDisplayDateTime(parsedDate);
    }

    return (
        <>
            <header className={styles["header-container"]}>
                <div className={styles.left}>
                    <NavLink to="/" className={styles.logoLink}>
                        <img src={logo} alt="UletiSmenu" />
                    </NavLink>
                </div>
                <div className={styles.right}>
                    <nav className={styles.desktopNav}>
                        <NavLink to={"/oglasi-za-posao"}>
                            <p>{t("header.posts")}</p>
                        </NavLink>
                        <NavLink to={"/restaurants"}>
                            <p>{t("header.restaurants")}</p>
                        </NavLink>
                        <select
                            value={i18n.language}
                            onChange={(event) => void i18n.changeLanguage(event.target.value)}
                            aria-label={t("common.language")}
                        >
                            <option value="sr">{t("common.serbian")}</option>
                            <option value="en">{t("common.english")}</option>
                        </select>
                    </nav>

                    <div className={styles.headerIcons}>
                        <div className={styles.headerLanguage}>
                            <select
                                className={styles.headerLanguageSelect}
                                value={i18n.language}
                                onChange={(event) => void i18n.changeLanguage(event.target.value)}
                                aria-label={t("common.language")}
                            >
                                <option value="sr">SR</option>
                                <option value="en">EN</option>
                            </select>
                        </div>
                        {canUseChat && (
                            <NavLink to="/messages" className={styles["messages-link"]} onClick={() => void loadUnreadChatCount()}>
                                <span className={styles["messages-button"]} aria-label={t("header.messages")}>
                                    💬
                                    {unreadChatCount > 0 && (
                                        <span className={styles["messages-count"]}>{unreadChatCount}</span>
                                    )}
                                </span>
                            </NavLink>
                        )}
                        {canUseNotifications && (
                            <div className={styles["notifications-wrapper"]}>
                                <button
                                    type="button"
                                    className={styles["notifications-button"]}
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsNotificationsOpen((previous) => !previous);
                                    }}
                                    aria-label={t("header.notifications")}
                                >
                                    🔔
                                    {unreadCount > 0 && <span className={styles["notifications-count"]}>{unreadCount}</span>}
                                </button>
                                {isNotificationsOpen && (
                                    <div className={styles["notifications-panel"]}>
                                        <h4>{t("header.notifications")}</h4>
                                        {notifications.length === 0 && <p className={styles["notifications-muted"]}>{t("header.noNotifications")}</p>}
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`${styles["notification-item"]} ${notification.isRead ? styles["notification-read"] : ""} ${removingNotificationIds.includes(notification.id) ? styles["notification-removing"] : ""}`}
                                                style={{
                                                    transform: `translateX(${notificationOffsets[notification.id] ?? 0}px)`,
                                                    transition:
                                                        draggingNotificationId === notification.id
                                                            ? "none"
                                                            : "transform 0.18s ease-out"
                                                }}
                                                onPointerDown={(event) => handlePointerDown(notification.id, event)}
                                                onPointerMove={(event) => handlePointerMove(notification.id, event)}
                                                onPointerUp={() => void handlePointerEnd(notification.id)}
                                                onPointerCancel={() => void handlePointerEnd(notification.id)}
                                            >
                                                <div className={styles["notification-item-header"]}>
                                                    <p
                                                        className={isNavigableNotification(notification.type) ? styles["notification-link"] : undefined}
                                                        onClick={() => {
                                                            if (!isNavigableNotification(notification.type)) {
                                                                return;
                                                            }

                                                            if (!notification.isRead) {
                                                                void handleMarkAsRead(notification.id);
                                                            }

                                                            setIsNotificationsOpen(false);
                                                            handleNotificationNavigation(notification, navigate);
                                                        }}
                                                    >
                                                        {notification.message}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className={styles["notification-delete-button"]}
                                                        onClick={() => void handleDeleteNotification(notification.id)}
                                                        disabled={activeNotificationId !== null || removingNotificationIds.includes(notification.id)}
                                                        aria-label={t("header.deleteNotification")}
                                                        title={t("header.deleteNotification")}
                                                    >
                                                        {activeNotificationId === notification.id ? "..." : "✕"}
                                                    </button>
                                                </div>
                                                <small>{formatNotificationDate(notification.createdAtUtc)}</small>
                                                {!notification.isRead && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleMarkAsRead(notification.id)}
                                                        disabled={activeNotificationId !== null || removingNotificationIds.includes(notification.id)}
                                                    >
                                                        {activeNotificationId === notification.id ? t("header.marking") : t("header.markAsRead")}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={styles.desktopAuth}>
                        {isLoggedIn && (
                            <>
                                <NavLink to={"/profile"}>
                                    <p>{t("header.profile")}</p>
                                </NavLink>
                                <button onClick={() => setIsLogoutModalOpened(!isLogoutModalOpened)}>{t("header.logout")}</button>
                            </>
                        )}
                        {!isLoggedIn && (
                            <>
                                <NavLink to="/registration">
                                    <p>{t("header.register")}</p>
                                </NavLink>
                                <NavLink to={"/login"}>
                                    <p>{t("header.login")}</p>
                                </NavLink>
                            </>
                        )}
                    </div>

                    <div className={styles.mobileMenu}>
                        <button
                            type="button"
                            className={styles.burgerButton}
                            aria-label={t("header.menu")}
                            aria-expanded={isMobileMenuOpen}
                            onClick={() => (isMobileMenuOpen ? closeMobileMenu() : openMobileMenu())}
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon aria-hidden="true" className={styles.burgerIcon} />
                            ) : (
                                <Bars3Icon aria-hidden="true" className={styles.burgerIcon} />
                            )}
                        </button>
                    </div>
                </div>
            </header>
            {isMobileMenuOpen && (
                <div className={styles.mobileOverlay} role="dialog" aria-modal="true" aria-label={t("header.menu")}>
                    <div className={styles.mobileOverlayHeader}>
                        <NavLink to="/" className={styles.mobileOverlayLogo} onClick={closeMobileMenu}>
                            <img src={logo} alt="" />
                        </NavLink>
                        <button
                            type="button"
                            className={styles.mobileOverlayClose}
                            aria-label={t("common.close")}
                            onClick={closeMobileMenu}
                        >
                            <XMarkIcon className={styles.burgerIcon} />
                        </button>
                    </div>
                    <nav className={styles.mobileOverlayNav}>
                        <NavLink to="/oglasi-za-posao" className={styles.mobileOverlayLink} onClick={closeMobileMenu}>
                            {t("header.posts")}
                        </NavLink>
                        <NavLink to="/restaurants" className={styles.mobileOverlayLink} onClick={closeMobileMenu}>
                            {t("header.restaurants")}
                        </NavLink>
                        {isLoggedIn ? (
                            <>
                                <NavLink to="/profile" className={styles.mobileOverlayLink} onClick={closeMobileMenu}>
                                    {t("header.profile")}
                                </NavLink>
                                <button
                                    type="button"
                                    className={styles.mobileOverlayButton}
                                    onClick={() => {
                                        closeMobileMenu();
                                        setIsLogoutModalOpened(true);
                                    }}
                                >
                                    {t("header.logout")}
                                </button>
                            </>
                        ) : (
                            <>
                <NavLink to="/registration" className={styles.mobileOverlayLink} onClick={closeMobileMenu}>
                                    {t("header.register")}
                                </NavLink>
                                <NavLink to="/login" className={styles.mobileOverlayLink} onClick={closeMobileMenu}>
                                    {t("header.login")}
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>
            )}
            {isLogoutModalOpened && (
                <ConfirmationDialog onConfirm={handleOnConfirm} onClose={() => setIsLogoutModalOpened(false)}/>
            )}
        </>
    );
};

export default Header;
