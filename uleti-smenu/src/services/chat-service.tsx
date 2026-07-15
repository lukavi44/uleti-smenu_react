import { AxiosResponse } from "axios";
import {
  ChatConversation,
  ChatConversationStatus,
  ChatMessage,
  ChatMessagePage,
} from "../models/Chat.model";
import axiosInstance from "./axiosConfig";

const normalizeStatus = (value: unknown): ChatConversationStatus => {
  const normalized = String(value ?? "Active").toLowerCase();
  return normalized === "archived" ? "Archived" : "Active";
};

const normalizeConversation = (data: Record<string, unknown>): ChatConversation => {
  const status = normalizeStatus(data.status ?? data.Status);
  const isReadOnly = Boolean(data.isReadOnly ?? data.IsReadOnly ?? status === "Archived");
  const canSendMessages = Boolean(
    data.canSendMessages ?? data.CanSendMessages ?? (!isReadOnly && status === "Active")
  );

  return {
    conversationId: String(data.conversationId ?? data.ConversationId ?? ""),
    applicationId: String(data.applicationId ?? data.ApplicationId ?? ""),
    jobPostId: String(data.jobPostId ?? data.JobPostId ?? ""),
    jobPostTitle: String(data.jobPostTitle ?? data.JobPostTitle ?? ""),
    restaurantLocationName: (data.restaurantLocationName ?? data.RestaurantLocationName) as
      | string
      | undefined,
    restaurantLocationCity: (data.restaurantLocationCity ?? data.RestaurantLocationCity) as
      | string
      | undefined,
    otherPartyName: String(data.otherPartyName ?? data.OtherPartyName ?? ""),
    otherPartyId: String(data.otherPartyId ?? data.OtherPartyId ?? "") || undefined,
    otherPartyProfilePhoto: (() => {
      const value = String(data.otherPartyProfilePhoto ?? data.OtherPartyProfilePhoto ?? "").trim();
      return value || undefined;
    })(),
    otherPartyPublicSlug: (() => {
      const value = String(data.otherPartyPublicSlug ?? data.OtherPartyPublicSlug ?? "").trim();
      return value || undefined;
    })(),
    lastMessagePreview: (data.lastMessagePreview ?? data.LastMessagePreview) as string | undefined,
    lastMessageAtUtc: (data.lastMessageAtUtc ?? data.LastMessageAtUtc) as string | undefined,
    unreadCount: Number(data.unreadCount ?? data.UnreadCount ?? 0),
    status,
    isReadOnly,
    canSendMessages,
  };
};

export type ChatConversationFilter = "active" | "archived";

export const GetMyChatConversations = async(
  status: ChatConversationFilter = "active"
): Promise<AxiosResponse<ChatConversation[]>> => {
  const response = await axiosInstance.get("/api/v1/Chat/conversations", {
    params: { status },
  });
  return {
    ...response,
    data: (response.data as Record<string, unknown>[]).map((item) => normalizeConversation(item)),
  };
};

export const GetChatConversationByApplication = async(
  applicationId: string
): Promise<AxiosResponse<ChatConversation>> => {
  const response = await axiosInstance.get(`/api/v1/Chat/applications/${applicationId}`);
  return {
    ...response,
    data: normalizeConversation(response.data as Record<string, unknown>),
  };
};

const normalizeMessage = (data: Record<string, unknown>): ChatMessage => ({
  id: String(data.id ?? data.Id ?? ""),
  senderId: String(data.senderId ?? data.SenderId ?? ""),
  content: String(data.content ?? data.Content ?? ""),
  sentAtUtc: String(data.sentAtUtc ?? data.SentAtUtc ?? ""),
});

export const GetChatMessages = async(
  conversationId: string,
  before?: string,
  pageSize = 30
): Promise<AxiosResponse<ChatMessagePage>> => {
  const response = await axiosInstance.get(
    `/api/v1/Chat/conversations/${conversationId}/messages`,
    {
      params: {
        pageSize,
        ...(before ? { before } : {}),
      },
    }
  );

  const raw = response.data as
    | Record<string, unknown>[]
    | { items?: unknown; Items?: unknown; hasMore?: unknown; HasMore?: unknown };

  // Support both the paginated shape and a plain array (backwards compatibility).
  const rawItems = Array.isArray(raw)
    ? raw
    : ((raw.items ?? raw.Items ?? []) as Record<string, unknown>[]);
  const hasMore = Array.isArray(raw)
    ? false
    : Boolean(raw.hasMore ?? raw.HasMore ?? false);

  return {
    ...response,
    data: {
      items: rawItems.map((item) => normalizeMessage(item as Record<string, unknown>)),
      hasMore,
    },
  };
};

export const SendChatMessage = async(
  conversationId: string,
  content: string
): Promise<AxiosResponse<ChatMessage>> => {
  const response = await axiosInstance.post(
    `/api/v1/Chat/conversations/${conversationId}/messages`,
    { content }
  );
  return {
    ...response,
    data: normalizeMessage(response.data as Record<string, unknown>),
  };
};

export const GetMyUnreadChatCount = async(): Promise<AxiosResponse<{ count: number }>> => {
  return axiosInstance.get<{ count: number }>("/api/v1/Chat/unread-count");
};

export const MarkChatConversationRead = async(conversationId: string): Promise<AxiosResponse> => {
  return axiosInstance.post(`/api/v1/Chat/conversations/${conversationId}/read`);
};
