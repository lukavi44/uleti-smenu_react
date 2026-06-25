import { useCallback, useContext, useEffect, useState } from "react";
import { ChatConversation } from "../models/Chat.model";
import { GetMyChatConversations } from "../services/chat-service";
import { GetEmployeePublicProfile } from "../services/employee-profile-service";
import { GetEmployersWithFavouriteStatus } from "../services/user-service";
import { AuthContext } from "../store/Auth-context";
import { subscribeChatMessages, subscribeChatUnreadCount } from "../services/realtime-service";

const FALLBACK_REFRESH_INTERVAL_MS = 60000;

export const useChatConversations = () => {
  const { authStatus, me, role } = useContext(AuthContext);
  const currentUserId = me && "id" in me ? me.id : "";
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [contactPhotos, setContactPhotos] = useState<Record<string, string>>({});

  const loadConversations = useCallback(async () => {
    try {
      const response = await GetMyChatConversations();
      setConversations(response.data);
      setLoadError(false);
    } catch {
      setLoadError(true);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    void loadConversations();

    const intervalId = window.setInterval(() => {
      void loadConversations();
    }, FALLBACK_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [authStatus, loadConversations]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const unsubscribeUnreadCount = subscribeChatUnreadCount(() => {
      void loadConversations();
    });

    const unsubscribeMessages = subscribeChatMessages((conversationId, message) => {
      if (message.senderId === currentUserId) return;

      setConversations((previousConversations) => {
        const updatedConversations = previousConversations.map((conversation) => {
          if (conversation.conversationId !== conversationId) return conversation;

          return {
            ...conversation,
            lastMessagePreview: message.content,
            lastMessageAtUtc: message.sentAtUtc,
            unreadCount: conversation.unreadCount + 1,
          };
        });

        return [...updatedConversations].sort((left, right) => {
          const leftTime = left.lastMessageAtUtc ? new Date(left.lastMessageAtUtc).getTime() : 0;
          const rightTime = right.lastMessageAtUtc ? new Date(right.lastMessageAtUtc).getTime() : 0;
          return rightTime - leftTime;
        });
      });
    });

    return () => {
      unsubscribeUnreadCount();
      unsubscribeMessages();
    };
  }, [authStatus, currentUserId, loadConversations]);

  useEffect(() => {
    if (conversations.length === 0) {
      setContactPhotos({});
      return;
    }

    const loadContactPhotos = async () => {
      if (role === "Employee") {
        try {
          const response = await GetEmployersWithFavouriteStatus();
          const photos = Object.fromEntries(
            response.data
              .filter((employer) => Boolean(employer.profilePhoto?.trim()))
              .map((employer) => [employer.id, employer.profilePhoto!.trim()])
          );
          setContactPhotos(photos);
        } catch {
          setContactPhotos({});
        }
        return;
      }

      if (role === "Employer") {
        const missingPhotoConversations = conversations.filter(
          (conversation) =>
            conversation.otherPartyId && !conversation.otherPartyProfilePhoto?.trim()
        );

        if (missingPhotoConversations.length === 0) {
          setContactPhotos({});
          return;
        }

        const entries = await Promise.all(
          missingPhotoConversations.map(async (conversation) => {
            try {
              const response = await GetEmployeePublicProfile(conversation.otherPartyId!);
              const photo = response.data.profilePhoto?.trim() ?? "";
              return [conversation.otherPartyId!, photo] as const;
            } catch {
              return [conversation.otherPartyId!, ""] as const;
            }
          })
        );

        setContactPhotos(Object.fromEntries(entries.filter(([, photo]) => Boolean(photo))));
      }
    };

    void loadContactPhotos();
  }, [conversations, role]);

  const resolveContactPhoto = useCallback(
    (conversation: ChatConversation) => {
      const fromConversation = conversation.otherPartyProfilePhoto?.trim();
      if (fromConversation) return fromConversation;

      const otherPartyId = conversation.otherPartyId;
      if (!otherPartyId) return undefined;

      return contactPhotos[otherPartyId]?.trim() || undefined;
    },
    [contactPhotos]
  );

  const getConversationById = useCallback(
    (conversationId: string) =>
      conversations.find((conversation) => conversation.conversationId === conversationId),
    [conversations]
  );

  return {
    conversations,
    isLoading,
    loadError,
    loadConversations,
    resolveContactPhoto,
    getConversationById,
  };
};
