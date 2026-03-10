import styles from "./Header.module.scss";
import { NavLink } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import "tailwindcss";

import logo from '../../assets/logo.png';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { AuthContext } from "../../store/Auth-context";
import RegistrationDialog from "../Dialog/RegistrationDialog";
import ConfirmationDialog from "../Dialog/ConfirmationDialog";
import { GetMyNotifications, GetMyUnreadNotificationCount, MarkNotificationAsRead } from "../../services/notification-service";
import { UserNotification } from "../../models/Notification.model";

// import ProfileDialog from "../Dialogs/ProfileDialog";
// import { AuthContext } from "../../store/Auth-context";
// import ConfirmationDialog from "../Dialog/ConfirmationDialog";

const Header = () => {
    const [isRegisterModalOpened, setIsRegisterModalOpened] = useState(false);
    const [isLogoutModalOpened, setIsLogoutModalOpened] = useState(false);
    const { isLoggedIn, logout, role } = useContext(AuthContext);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);

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
                                    {selectedCity || "Grad"}
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
                            <p>Oglasi</p>
                        </NavLink>
                        <NavLink to={"/restaurants"}>
                            <p>Restorani</p>
                        </NavLink>
                        {isEmployeeLoggedIn && (
                            <div className={styles["notifications-wrapper"]}>
                                <button
                                    type="button"
                                    className={styles["notifications-button"]}
                                    onClick={() => setIsNotificationsOpen((previous) => !previous)}
                                    aria-label="Notifications"
                                >
                                    🔔
                                    {unreadCount > 0 && <span className={styles["notifications-count"]}>{unreadCount}</span>}
                                </button>
                                {isNotificationsOpen && (
                                    <div className={styles["notifications-panel"]}>
                                        <h4>Notifications</h4>
                                        {notifications.length === 0 && <p className={styles["notifications-muted"]}>No notifications yet.</p>}
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`${styles["notification-item"]} ${notification.isRead ? styles["notification-read"] : ""}`}
                                            >
                                                <p>{notification.message}</p>
                                                <small>{formatNotificationDate(notification.createdAtUtc)}</small>
                                                {!notification.isRead && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        disabled={activeNotificationId !== null}
                                                    >
                                                        {activeNotificationId === notification.id ? "Marking..." : "Mark as read"}
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
                                    <p>Profil</p>
                                </NavLink>
                                <button onClick={() => setIsLogoutModalOpened(!isLogoutModalOpened)}>Odjava</button>
                            </>
                        )}
                        {!isLoggedIn && (
                            <>
                                <p onClick={() => setIsRegisterModalOpened(!isRegisterModalOpened)}>Registruj se</p>
                                <NavLink to={"/login"}>
                                    <p>Prijavi se</p>
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
