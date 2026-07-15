import { FormEvent, Fragment, useCallback, useContext, useEffect, useRef, useState } from "react";
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
  readOnly?: boolean;
  variant?: "embedded" | "full" | "mobileFull";
  otherPartyName?: string;
  otherPartyProfilePhoto?: string;
  otherPartyProfilePath?: string;
  onMessagesChange?: () => void;
}

const MESSAGE_PAGE_SIZE = 30;
const NEAR_EDGE_THRESHOLD_PX = 80;

const sortBySentAt = (messages: ChatMessage[]): ChatMessage[] =>
  [...messages].sort(
    (first, second) => new Date(first.sentAtUtc).getTime() - new Date(second.sentAtUtc).getTime()
  );

const mergeMessages = (existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] => {
  const seen = new Set(existing.map((message) => message.id));
  const merged = [...existing];

  incoming.forEach((message) => {
    if (!seen.has(message.id)) {
      merged.push(message);
      seen.add(message.id);
    }
  });

  return sortBySentAt(merged);
};

const ConversationChatThread = ({
  conversationId,
  active = true,
  readOnly = false,
  variant = "embedded",
  otherPartyName = "",
  otherPartyProfilePhoto,
  otherPartyProfilePath,
  onMessagesChange,
}: ConversationChatThreadProps) => {
  const { t, i18n } = useTranslation();
  const { me } = useContext(AuthContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const isLoadingOlderRef = useRef(false);
  const onMessagesChangeRef = useRef(onMessagesChange);

  onMessagesChangeRef.current = onMessagesChange;

  const currentUserId = me && "id" in me ? me.id : "";
  const currentUserName =
    me && "firstName" in me
      ? `${me.firstName} ${me.lastName}`.trim()
      : me && "name" in me
        ? String(me.name)
        : t("chat.you");
  const currentUserPhoto = me?.profilePhoto?.trim() || undefined;
  const isMobileFull = variant === "mobileFull";
  const isFull = variant === "full";
  const rootClassName = [
    styles.thread,
    isFull ? styles.threadFull : "",
    isMobileFull ? styles.threadMobileFull : "",
  ]
    .filter(Boolean)
    .join(" ");

  const setVisibleMessages = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const isNearBottom = useCallback((container: HTMLDivElement) => {
    return container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_EDGE_THRESHOLD_PX;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  const markConversationRead = useCallback(async () => {
    try {
      await MarkChatConversationRead(conversationId);
      onMessagesChangeRef.current?.();
    } catch {
      // Marking as read is best-effort; ignore failures so the thread still renders.
    }
  }, [conversationId]);

  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlderRef.current || !hasMoreOlder) {
      return;
    }

    const oldest = messagesRef.current[0];
    if (!oldest) {
      return;
    }

    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight ?? 0;
    const previousScrollTop = container?.scrollTop ?? 0;

    isLoadingOlderRef.current = true;
    setIsLoadingOlder(true);

    try {
      const response = await GetChatMessages(conversationId, oldest.sentAtUtc, MESSAGE_PAGE_SIZE);
      const merged = mergeMessages(messagesRef.current, response.data.items);
      setVisibleMessages(merged);
      setHasMoreOlder(response.data.hasMore);

      // Preserve the viewport so the list does not jump after prepending.
      requestAnimationFrame(() => {
        const nextContainer = messagesContainerRef.current;
        if (nextContainer) {
          const heightDelta = nextContainer.scrollHeight - previousScrollHeight;
          nextContainer.scrollTop = previousScrollTop + heightDelta;
        }
      });
    } catch {
      // Leave the current messages in place on failure.
    } finally {
      isLoadingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  }, [conversationId, hasMoreOlder, setVisibleMessages]);

  useEffect(() => {
    if (!active || !conversationId) {
      return;
    }

    let cancelled = false;

    messagesRef.current = [];
    isLoadingOlderRef.current = false;
    setMessages([]);
    setHasMoreOlder(false);
    setIsLoadingOlder(false);
    setLoadError(false);
    setDraftMessage("");
    setIsLoading(true);

    const loadInitialMessages = async () => {
      try {
        const response = await GetChatMessages(conversationId, undefined, MESSAGE_PAGE_SIZE);
        if (cancelled) {
          return;
        }

        const initial = sortBySentAt(response.data.items);
        setVisibleMessages(initial);
        setHasMoreOlder(response.data.hasMore);

        requestAnimationFrame(() => {
          if (!cancelled) {
            scrollToBottom("auto");
          }
        });
      } catch {
        if (!cancelled) {
          setLoadError(true);
          messagesRef.current = [];
          setMessages([]);
          setHasMoreOlder(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }

      // Mark read separately so a failure here never hides the loaded messages.
      if (!cancelled) {
        await markConversationRead();
      }
    };

    void loadInitialMessages();

    return () => {
      cancelled = true;
    };
  }, [active, conversationId, markConversationRead, scrollToBottom, setVisibleMessages]);

  useEffect(() => {
    if (!active || !conversationId) {
      return;
    }

    void joinConversation(conversationId);

    const unsubscribe = subscribeChatMessages((incomingConversationId, message) => {
      if (incomingConversationId !== conversationId) {
        return;
      }

      if (messagesRef.current.some((existing) => existing.id === message.id)) {
        return;
      }

      const container = messagesContainerRef.current;
      const shouldAutoScroll = container ? isNearBottom(container) : true;
      const fromOtherParty = message.senderId !== currentUserId;

      setVisibleMessages(mergeMessages(messagesRef.current, [message]));

      if (shouldAutoScroll) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }

      // A message received while the conversation is open should clear the badge immediately.
      if (fromOtherParty) {
        void markConversationRead();
      }
    });

    return () => {
      unsubscribe();
      void leaveConversation(conversationId);
    };
  }, [
    active,
    conversationId,
    currentUserId,
    isNearBottom,
    markConversationRead,
    scrollToBottom,
    setVisibleMessages,
  ]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage || isSending || readOnly) {
      return;
    }

    setIsSending(true);
    try {
      const response = await SendChatMessage(conversationId, trimmedMessage);
      setVisibleMessages(mergeMessages(messagesRef.current, [response.data]));
      setDraftMessage("");
      requestAnimationFrame(() => scrollToBottom("smooth"));
      onMessagesChangeRef.current?.();
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
              <span>{formatChatDateSeparator(message.sentAtUtc)}</span>
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
            to={otherPartyProfilePath}
            ariaLabel={t("messages.viewProfile", { name: otherPartyName })}
          />
        ) : null}
        <div className={`${styles.message} ${isMine ? styles.messageMine : styles.messageOther}`}>
          <span>{message.content}</span>
          <span className={styles.messageMeta}>{messageTime}</span>
        </div>
        {isMine ? (
          <ChatContactAvatar name={currentUserName} profilePhoto={currentUserPhoto} size="sm" />
        ) : null}
      </div>
    );
  };

  const showInitialLoading = isLoading && messages.length === 0;

  return (
    <div className={rootClassName}>
      {showInitialLoading && <p className={styles.mutedText}>{t("chat.loading")}</p>}
      {loadError && !isLoading && <p className={styles.mutedText}>{t("chat.loadError")}</p>}

      {!loadError && !showInitialLoading && (
        <>
          <div ref={messagesContainerRef} className={styles.messages}>
            {(hasMoreOlder || isLoadingOlder) && (
              <div className={styles.loadOlderRow}>
                {isLoadingOlder ? (
                  <span className={styles.topLoader} role="status" aria-live="polite">
                    {t("chat.loadingOlder")}
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.loadOlderButton}
                    onClick={() => void loadOlderMessages()}
                  >
                    {t("chat.loadOlder")}
                  </button>
                )}
              </div>
            )}
            {messages.length === 0 && !isLoading && (
              <p className={styles.emptyMessages}>{t("chat.noMessages")}</p>
            )}
            {messages.map((message, index) => renderMessage(message, index))}
          </div>

          {readOnly && <p className={styles.readOnlyNotice}>{t("chat.readOnlyNotice")}</p>}

          {!readOnly && (
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
          )}
        </>
      )}
    </div>
  );
};

export default ConversationChatThread;
