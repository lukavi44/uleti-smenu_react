import { AxiosResponse } from "axios";
import { ChatConversation, ChatConversationStatus, ChatMessage } from "../models/Chat.model";
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

export const GetChatMessages = async(
  conversationId: string
): Promise<AxiosResponse<ChatMessage[]>> => {
  return axiosInstance.get<ChatMessage[]>(`/api/v1/Chat/conversations/${conversationId}/messages`);
};

export const SendChatMessage = async(
  conversationId: string,
  content: string
): Promise<AxiosResponse<ChatMessage>> => {
  return axiosInstance.post<ChatMessage>(`/api/v1/Chat/conversations/${conversationId}/messages`, {
    content,
  });
};

export const GetMyUnreadChatCount = async(): Promise<AxiosResponse<{ count: number }>> => {
  return axiosInstance.get<{ count: number }>("/api/v1/Chat/unread-count");
};

export const MarkChatConversationRead = async(conversationId: string): Promise<AxiosResponse> => {
  return axiosInstance.post(`/api/v1/Chat/conversations/${conversationId}/read`);
};
