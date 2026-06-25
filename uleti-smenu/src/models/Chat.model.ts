export interface ChatConversation {
  conversationId: string;
  applicationId: string;
  jobPostId: string;
  jobPostTitle: string;
  otherPartyName: string;
  otherPartyId?: string;
  otherPartyProfilePhoto?: string;
  lastMessagePreview?: string;
  lastMessageAtUtc?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  sentAtUtc: string;
}
