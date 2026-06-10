import * as signalR from "@microsoft/signalr";
import getApiBaseUrl from "../configuration/config";
import { ChatMessage } from "../models/Chat.model";
import { UserNotification } from "../models/Notification.model";

type ChatMessageHandler = (conversationId: string, message: ChatMessage) => void;
type ChatUnreadCountHandler = (count: number) => void;
type NotificationHandler = (notification: UserNotification, unreadCount: number) => void;

let connection: signalR.HubConnection | null = null;
let startPromise: Promise<void> | null = null;

const chatMessageHandlers = new Set<ChatMessageHandler>();
const chatUnreadCountHandlers = new Set<ChatUnreadCountHandler>();
const notificationHandlers = new Set<NotificationHandler>();

const getConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${getApiBaseUrl()}/hubs/realtime`, {
        accessTokenFactory: () => localStorage.getItem("AccessToken") ?? "",
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveChatMessage", (payload: { conversationId: string; message: ChatMessage }) => {
      chatMessageHandlers.forEach((handler) => handler(payload.conversationId, payload.message));
    });

    connection.on("ChatUnreadCountUpdated", (payload: { count: number }) => {
      chatUnreadCountHandlers.forEach((handler) => handler(payload.count));
    });

    connection.on(
      "NotificationReceived",
      (payload: { notification: UserNotification; unreadCount: number }) => {
        notificationHandlers.forEach((handler) => handler(payload.notification, payload.unreadCount));
      }
    );
  }

  return connection;
};

export const subscribeChatMessages = (handler: ChatMessageHandler) => {
  chatMessageHandlers.add(handler);
  return () => chatMessageHandlers.delete(handler);
};

export const subscribeChatUnreadCount = (handler: ChatUnreadCountHandler) => {
  chatUnreadCountHandlers.add(handler);
  return () => chatUnreadCountHandlers.delete(handler);
};

export const subscribeNotifications = (handler: NotificationHandler) => {
  notificationHandlers.add(handler);
  return () => notificationHandlers.delete(handler);
};

export const startRealtimeConnection = async () => {
  const token = localStorage.getItem("AccessToken");
  if (!token) {
    return;
  }

  const hubConnection = getConnection();
  if (hubConnection.state === signalR.HubConnectionState.Connected) {
    return;
  }

  if (!startPromise) {
    startPromise = hubConnection
      .start()
      .catch((error) => {
        startPromise = null;
        throw error;
      })
      .then(() => undefined);
  }

  await startPromise;
};

export const stopRealtimeConnection = async () => {
  if (!connection) {
    return;
  }

  await connection.stop();
  connection = null;
  startPromise = null;
};

export const joinConversation = async (conversationId: string) => {
  await startRealtimeConnection();
  if (connection?.state === signalR.HubConnectionState.Connected) {
    await connection.invoke("JoinConversation", conversationId);
  }
};

export const leaveConversation = async (conversationId: string) => {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    await connection.invoke("LeaveConversation", conversationId);
  }
};
