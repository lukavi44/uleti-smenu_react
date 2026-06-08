import { AxiosResponse } from "axios";
import { ChatConversation, ChatMessage } from "../models/Chat.model";
import axiosInstance from "./axiosConfig";

export const GetMyChatConversations = async (): Promise<AxiosResponse<ChatConversation[]>> => {
  return axiosInstance.get<ChatConversation[]>("/api/v1/Chat/conversations");
};

export const GetChatConversationByApplication = async(
  applicationId: string
): Promise<AxiosResponse<ChatConversation>> => {
  return axiosInstance.get<ChatConversation>(`/api/v1/Chat/applications/${applicationId}`);
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
