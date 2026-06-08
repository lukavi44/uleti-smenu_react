import styles from "./Header.module.scss";
import { NavLink } from "react-router-dom";
import { PointerEvent, useContext, useEffect, useState } from "react";

import "tailwindcss";

import logo from '../../assets/logo.png';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { AuthContext } from "../../store/Auth-context";
import RegistrationDialog from "../Dialog/RegistrationDialog";
import ConfirmationDialog from "../Dialog/ConfirmationDialog";
import { DeleteNotification, GetMyNotifications, GetMyUnreadNotificationCount, MarkNotificationAsRead } from "../../services/notification-service";
import { UserNotification } from "../../models/Notification.model";
import { useTranslation } from "react-i18next";

// import ProfileDialog from "../Dialogs/ProfileDialog";
// import { AuthContext } from "../../store/Auth-context";
// import ConfirmationDialog from "../Dialog/ConfirmationDialog";

const Header = () => {
    const { t, i18n } = useTranslation();
    const [isRegisterModalOpened, setIsRegisterModalOpened] = useState(false);
    const [isLogoutModalOpened, setIsLogoutModalOpened] = useState(false);
    const { isLoggedIn, logout, role } = useContext(AuthContext);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);
    const [notificationOffsets, setNotificationOffsets] = useState<Record<string, number>>({});
    const [draggingNotificationId, setDraggingNotificationId] = useState<string | null>(null);
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const [removingNotificationIds, setRemovingNotificationIds] = useState<string[]>([]);

    const swipeDeleteThreshold = 90;
    const maxSwipeDistance = 140;
    const removeAnimationDurationMs = 240;

    const isEmployeeLoggedIn = isLoggedIn && role === "Employee";

    const loadNotifications = async () => {
        if (!isEmployeeLoggedIn) {
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
        loadNotifications();
    }, [isEmployeeLoggedIn]);

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
        return parsedDate.toLocaleString();
    }

    return (
        <>
            <header className={styles["header-container"]}>
                <div className={styles.left}>
                    <NavLink to="">
                        <img src={logo} alt="" />
                    </NavLink>
                </div>
                <div className={styles.right}>
                    <div className={styles.mobile}>
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
                                    {selectedCity || t("header.city")}
                                    <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
                                </MenuButton>
                            </div>

                            <MenuItems
                                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-none"
                            >
                                <div className="py-1">
                                    {["Novi Sad", "Beograd", "Kragujevac"].map((city) => (
                                        <MenuItem key={city}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setSelectedCity(city)}
                                                    className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                                        }`}
                                                >
                                                    {city}
                                                </button>
                                            )}
                                        </MenuItem>
                                    ))}
                                </div>
                            </MenuItems>
                        </Menu>
                    </div>
                    <div className={`${styles.desktop}`}>
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
                        {isEmployeeLoggedIn && (
                            <div className={styles["notifications-wrapper"]}>
                                <button
                                    type="button"
                                    className={styles["notifications-button"]}
                                    onClick={() => setIsNotificationsOpen((previous) => !previous)}
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
                                                    <p>{notification.message}</p>
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
                                <p onClick={() => setIsRegisterModalOpened(!isRegisterModalOpened)}>{t("header.register")}</p>
                                <NavLink to={"/login"}>
                                    <p>{t("header.login")}</p>
                                </NavLink>
                            </>
                        )}
                        {isRegisterModalOpened && (
                            <RegistrationDialog onClose={() => setIsRegisterModalOpened(false)} />
                        )}
                        {isLogoutModalOpened && (
                            <ConfirmationDialog onConfirm={handleOnConfirm} onClose={() => setIsLogoutModalOpened(false)}/>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
