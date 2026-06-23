import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ConversationChatThread from "../../components/Chat/ConversationChatThread";
import { ChatConversation } from "../../models/Chat.model";
import { GetMyChatConversations } from "../../services/chat-service";
import { AuthContext } from "../../store/Auth-context";
import { subscribeChatMessages, subscribeChatUnreadCount } from "../../services/realtime-service";
import styles from "./MessagesPage.module.scss";

const FALLBACK_REFRESH_INTERVAL_MS = 60000;

const MessagesPage = () => {
  const { t } = useTranslation();
  const { authStatus, me } = useContext(AuthContext);
  const currentUserId = me && "id" in me ? me.id : "";
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const response = await GetMyChatConversations();
      setConversations(response.data);
      setLoadError(false);

      setSelectedConversationId((previousSelection) => {
        if (previousSelection && response.data.some((item) => item.conversationId === previousSelection)) {
          return previousSelection;
        }

        return response.data[0]?.conversationId ?? null;
      });
    } catch {
      setLoadError(true);
      setConversations([]);
      setSelectedConversationId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    void loadConversations();

    const intervalId = window.setInterval(() => {
      void loadConversations();
    }, FALLBACK_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [authStatus, loadConversations]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    const unsubscribeUnreadCount = subscribeChatUnreadCount(() => {
      void loadConversations();
    });

    const unsubscribeMessages = subscribeChatMessages((conversationId, message) => {
      if (message.senderId === currentUserId) {
        return;
      }

      setConversations((previousConversations) => {
        const updatedConversations = previousConversations.map((conversation) => {
          if (conversation.conversationId !== conversationId) {
            return conversation;
          }

          return {
            ...conversation,
            lastMessagePreview: message.content,
            lastMessageAtUtc: message.sentAtUtc,
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

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const selectedConversation = conversations.find(
    (conversation) => conversation.conversationId === selectedConversationId
  );

  const formatConversationDate = (value?: string) => {
    if (!value) {
      return "";
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("messages.title")}</h1>

      {isLoading && <p className={styles.mutedText}>{t("messages.loading")}</p>}
      {loadError && !isLoading && <p className={styles.mutedText}>{t("messages.loadError")}</p>}

      {!isLoading && !loadError && conversations.length === 0 && (
        <p className={styles.mutedText}>{t("messages.noConversations")}</p>
      )}

      {!isLoading && !loadError && conversations.length > 0 && (
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            {conversations.map((conversation) => {
              const isSelected = conversation.conversationId === selectedConversationId;
              return (
                <button
                  key={conversation.conversationId}
                  type="button"
                  className={`${styles.conversationItem} ${isSelected ? styles.conversationItemActive : ""}`}
                  onClick={() => handleSelectConversation(conversation.conversationId)}
                >
                  {conversation.unreadCount > 0 && (
                    <span className={styles.unreadBadge} aria-label={t("messages.unreadCount", { count: conversation.unreadCount })}>
                      {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                    </span>
                  )}
                  <div className={styles.conversationHeader}>
                    <strong>{conversation.otherPartyName}</strong>
                  </div>
                  <p className={styles.jobTitle}>{conversation.jobPostTitle}</p>
                  <p className={styles.preview}>
                    {conversation.lastMessagePreview || t("messages.noPreview")}
                  </p>
                  <small className={styles.timestamp}>
                    {formatConversationDate(conversation.lastMessageAtUtc)}
                  </small>
                </button>
              );
            })}
          </aside>

          <section className={styles.threadPanel}>
            {selectedConversation ? (
              <>
                <div className={styles.threadHeader}>
                  <h2>{selectedConversation.otherPartyName}</h2>
                  <p>{selectedConversation.jobPostTitle}</p>
                </div>
                <ConversationChatThread
                  key={selectedConversation.conversationId}
                  conversationId={selectedConversation.conversationId}
                  active
                  variant="full"
                  onMessagesChange={() => void loadConversations()}
                />
              </>
            ) : (
              <p className={styles.mutedText}>{t("messages.selectConversation")}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
