import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import { ChatMessage } from "../../models/Chat.model";
import {
  GetChatMessages,
  MarkChatConversationRead,
  SendChatMessage,
} from "../../services/chat-service";
import styles from "./ConversationChatThread.module.scss";

interface ConversationChatThreadProps {
  conversationId: string;
  active?: boolean;
  variant?: "embedded" | "full";
  onMessagesChange?: () => void;
}

const POLL_INTERVAL_MS = 5000;

const ConversationChatThread = ({
  conversationId,
  active = true,
  variant = "embedded",
  onMessagesChange,
}: ConversationChatThreadProps) => {
  const { t } = useTranslation();
  const { me } = useContext(AuthContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = me && "id" in me ? me.id : "";
  const rootClassName =
    variant === "full" ? `${styles.thread} ${styles.threadFull}` : styles.thread;

  const scrollToLatestMessage = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (shouldMarkRead: boolean) => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const messagesResponse = await GetChatMessages(conversationId);
      setMessages(messagesResponse.data);

      if (shouldMarkRead) {
        await MarkChatConversationRead(conversationId);
        onMessagesChange?.();
      }
    } catch {
      setLoadError(true);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!active || !conversationId) {
      return;
    }

    void loadMessages(true);
  }, [active, conversationId]);

  useEffect(() => {
    if (!active || !conversationId) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const messagesResponse = await GetChatMessages(conversationId);
        setMessages(messagesResponse.data);
      } catch {
        // Keep existing messages visible while polling retries on next tick.
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [active, conversationId]);

  useEffect(() => {
    if (active) {
      scrollToLatestMessage();
    }
  }, [messages, active]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage || isSending) {
      return;
    }

    setIsSending(true);
    try {
      const response = await SendChatMessage(conversationId, trimmedMessage);
      setMessages((previous) => [...previous, response.data]);
      setDraftMessage("");
      onMessagesChange?.();
    } catch {
      setLoadError(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={rootClassName}>
      {isLoading && <p className={styles.mutedText}>{t("chat.loading")}</p>}
      {loadError && !isLoading && <p className={styles.mutedText}>{t("chat.loadError")}</p>}

      {!isLoading && !loadError && (
        <>
          <div className={styles.messages}>
            {messages.length === 0 && (
              <p className={styles.emptyMessages}>{t("chat.noMessages")}</p>
            )}
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`${styles.message} ${isMine ? styles.messageMine : styles.messageOther}`}
                >
                  <span>{message.content}</span>
                  <span className={styles.messageMeta}>
                    {new Date(message.sentAtUtc).toLocaleString()}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.composer} onSubmit={handleSend}>
            <input
              className={styles.input}
              type="text"
              value={draftMessage}
              maxLength={2000}
              placeholder={t("chat.messagePlaceholder")}
              onChange={(event) => setDraftMessage(event.target.value)}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isSending || draftMessage.trim() === ""}
            >
              {isSending ? t("chat.sending") : t("chat.send")}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ConversationChatThread;
