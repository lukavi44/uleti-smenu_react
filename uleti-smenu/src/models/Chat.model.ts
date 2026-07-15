export type ChatConversationStatus = "Active" | "Archived";

export interface ChatConversation {
  conversationId: string;
  applicationId: string;
  jobPostId: string;
  jobPostTitle: string;
  restaurantLocationName?: string;
  restaurantLocationCity?: string;
  otherPartyName: string;
  otherPartyId?: string;
  otherPartyProfilePhoto?: string;
  otherPartyPublicSlug?: string;
  lastMessagePreview?: string;
  lastMessageAtUtc?: string;
  unreadCount: number;
  status: ChatConversationStatus;
  isReadOnly: boolean;
  canSendMessages: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  sentAtUtc: string;
}

export interface ChatMessagePage {
  items: ChatMessage[];
  hasMore: boolean;
}
