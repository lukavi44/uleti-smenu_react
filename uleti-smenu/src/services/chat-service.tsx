import { AxiosResponse } from "axios";
import { ChatConversation, ChatMessage } from "../models/Chat.model";
import axiosInstance from "./axiosConfig";

const normalizeConversation = (data: Record<string, unknown>): ChatConversation => ({
  conversationId: String(data.conversationId ?? data.ConversationId ?? ""),
  applicationId: String(data.applicationId ?? data.ApplicationId ?? ""),
  jobPostId: String(data.jobPostId ?? data.JobPostId ?? ""),
  jobPostTitle: String(data.jobPostTitle ?? data.JobPostTitle ?? ""),
  otherPartyName: String(data.otherPartyName ?? data.OtherPartyName ?? ""),
  otherPartyId: String(data.otherPartyId ?? data.OtherPartyId ?? "") || undefined,
  otherPartyProfilePhoto: (() => {
    const value = String(data.otherPartyProfilePhoto ?? data.OtherPartyProfilePhoto ?? "").trim();
    return value || undefined;
  })(),
  lastMessagePreview: (data.lastMessagePreview ?? data.LastMessagePreview) as string | undefined,
  lastMessageAtUtc: (data.lastMessageAtUtc ?? data.LastMessageAtUtc) as string | undefined,
  unreadCount: Number(data.unreadCount ?? data.UnreadCount ?? 0),
});

export const GetMyChatConversations = async (): Promise<AxiosResponse<ChatConversation[]>> => {
  const response = await axiosInstance.get("/api/v1/Chat/conversations");
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
