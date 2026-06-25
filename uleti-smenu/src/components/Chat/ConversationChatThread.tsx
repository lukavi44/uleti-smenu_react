import { FormEvent, Fragment, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon } from "@heroicons/react/24/outline";
import { CheckIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { AuthContext } from "../../store/Auth-context";
import { ChatMessage } from "../../models/Chat.model";
import {
  GetChatMessages,
  MarkChatConversationRead,
  SendChatMessage,
} from "../../services/chat-service";
import {
  joinConversation,
  leaveConversation,
  subscribeChatMessages,
} from "../../services/realtime-service";
import {
  formatChatDateSeparator,
  formatChatMessageTime,
  isDifferentDay,
} from "../../helpers/formatConversationTimestamp";
import ChatContactAvatar from "./ChatContactAvatar";
import styles from "./ConversationChatThread.module.scss";

interface ConversationChatThreadProps {
  conversationId: string;
  active?: boolean;
  variant?: "embedded" | "full" | "mobileFull";
  otherPartyName?: string;
  otherPartyProfilePhoto?: string;
  onMessagesChange?: () => void;
}

const ConversationChatThread = ({
  conversationId,
  active = true,
  variant = "embedded",
  otherPartyName = "",
  otherPartyProfilePhoto,
  onMessagesChange,
}: ConversationChatThreadProps) => {
  const { t, i18n } = useTranslation();
  const { me } = useContext(AuthContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = me && "id" in me ? me.id : "";
  const currentUserName =
    me && "firstName" in me
      ? `${me.firstName} ${me.lastName}`.trim()
      : me && "name" in me
        ? String(me.name)
        : t("chat.you");
  const currentUserPhoto = me?.profilePhoto?.trim() || undefined;
  const isMobileFull = variant === "mobileFull";
  const rootClassName = [
    styles.thread,
    variant === "full" ? styles.threadFull : "",
    isMobileFull ? styles.threadMobileFull : "",
  ]
    .filter(Boolean)
    .join(" ");

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

    void joinConversation(conversationId);

    const unsubscribe = subscribeChatMessages((incomingConversationId, message) => {
      if (incomingConversationId !== conversationId) {
        return;
      }

      setMessages((previous) => {
        if (previous.some((item) => item.id === message.id)) {
          return previous;
        }

        return [...previous, message];
      });
    });

    return () => {
      unsubscribe();
      void leaveConversation(conversationId);
    };
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
      setMessages((previous) => {
        if (previous.some((item) => item.id === response.data.id)) {
          return previous;
        }

        return [...previous, response.data];
      });
      setDraftMessage("");
      onMessagesChange?.();
    } catch {
      setLoadError(true);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isMine = message.senderId === currentUserId;
    const showDateSeparator =
      index === 0 || isDifferentDay(messages[index - 1].sentAtUtc, message.sentAtUtc);
    const messageTime = formatChatMessageTime(message.sentAtUtc, i18n.language);

    if (isMobileFull) {
      return (
        <Fragment key={message.id}>
          {showDateSeparator && (
            <div className={styles.dateSeparator}>
              <span>{formatChatDateSeparator(message.sentAtUtc, i18n.language)}</span>
            </div>
          )}
          <div
            className={`${styles.messageBlock} ${isMine ? styles.messageBlockMine : styles.messageBlockOther}`}
          >
            <div
              className={`${styles.messageBubble} ${isMine ? styles.messageBubbleMine : styles.messageBubbleOther}`}
            >
              {message.content}
            </div>
            <div className={`${styles.messageFooter} ${isMine ? styles.messageFooterMine : ""}`}>
              <span>{messageTime}</span>
              {isMine && (
                <span className={styles.readReceipt} aria-label={t("chat.read")}>
                  <CheckIcon className={styles.checkIcon} aria-hidden />
                  <CheckIcon className={`${styles.checkIcon} ${styles.checkIconSecond}`} aria-hidden />
                </span>
              )}
            </div>
          </div>
        </Fragment>
      );
    }

    return (
      <div
        key={message.id}
        className={`${styles.messageRow} ${isMine ? styles.messageRowMine : styles.messageRowOther}`}
      >
        {!isMine ? (
          <ChatContactAvatar
            name={otherPartyName}
            profilePhoto={otherPartyProfilePhoto}
            size="sm"
          />
        ) : null}
        <div className={`${styles.message} ${isMine ? styles.messageMine : styles.messageOther}`}>
          <span>{message.content}</span>
          <span className={styles.messageMeta}>{new Date(message.sentAtUtc).toLocaleString()}</span>
        </div>
        {isMine ? (
          <ChatContactAvatar name={currentUserName} profilePhoto={currentUserPhoto} size="sm" />
        ) : null}
      </div>
    );
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
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </div>

          <form
            className={`${styles.composer} ${isMobileFull ? styles.composerMobile : ""}`}
            onSubmit={handleSend}
          >
            {isMobileFull && (
              <button type="button" className={styles.attachButton} aria-label={t("chat.attach")}>
                <PlusIcon className={styles.attachIcon} aria-hidden />
              </button>
            )}
            <input
              className={`${styles.input} ${isMobileFull ? styles.inputMobile : ""}`}
              type="text"
              value={draftMessage}
              maxLength={2000}
              placeholder={t("chat.messagePlaceholder")}
              onChange={(event) => setDraftMessage(event.target.value)}
            />
            {isMobileFull ? (
              <button
                type="submit"
                className={styles.sendButtonMobile}
                disabled={isSending || draftMessage.trim() === ""}
                aria-label={t("chat.send")}
              >
                <PaperAirplaneIcon className={styles.sendIcon} aria-hidden />
              </button>
            ) : (
              <button
                type="submit"
                className={styles.sendButton}
                disabled={isSending || draftMessage.trim() === ""}
              >
                {isSending ? t("chat.sending") : t("chat.send")}
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default ConversationChatThread;
