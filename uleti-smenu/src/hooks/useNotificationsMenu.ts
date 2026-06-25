import { PointerEvent, useEffect, useState } from "react";
import {
  DeleteNotification,
  GetMyNotifications,
  GetMyUnreadNotificationCount,
  MarkNotificationAsRead,
} from "../services/notification-service";
import { subscribeNotifications } from "../services/realtime-service";
import { UserNotification } from "../models/Notification.model";

const swipeDeleteThreshold = 90;
const maxSwipeDistance = 140;
const removeAnimationDurationMs = 240;

export const useNotificationsMenu = (enabled: boolean) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);
  const [notificationOffsets, setNotificationOffsets] = useState<Record<string, number>>({});
  const [draggingNotificationId, setDraggingNotificationId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [removingNotificationIds, setRemovingNotificationIds] = useState<string[]>([]);

  const loadNotifications = async () => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        GetMyNotifications(),
        GetMyUnreadNotificationCount(),
      ]);

      setNotifications(notificationsResponse.data);
      setUnreadCount(unreadCountResponse.data.count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

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
      unsubscribeNotifications();
    };
  }, [enabled]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-notifications-menu]")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

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
    setNotificationOffsets((previousOffsets) => ({
      ...previousOffsets,
      [notificationId]: -maxSwipeDistance,
    }));

    try {
      await Promise.all([
        deleteRequest,
        new Promise((resolve) => setTimeout(resolve, removeAnimationDurationMs)),
      ]);

      removeNotificationFromState(notificationId, shouldDecreaseUnread);
    } catch {
      setRemovingNotificationIds((previousIds) => previousIds.filter((id) => id !== notificationId));
      setNotificationOffsets((previousOffsets) => ({
        ...previousOffsets,
        [notificationId]: 0,
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
      [notificationId]: clampedLeftSwipe,
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
      [notificationId]: 0,
    }));
  };

  const toggleOpen = () => setIsOpen((previous) => !previous);
  const close = () => setIsOpen(false);

  return {
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
  };
};
