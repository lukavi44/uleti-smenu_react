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
  onMessagesChange?: () => void;
}

const MESSAGE_WINDOW_SIZE = 30;
const NEAR_EDGE_THRESHOLD_PX = 80;

const mergeMessages = (existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] => {
  const seen = new Set(existing.map((message) => message.id));
  const merged = [...existing];

  incoming.forEach((message) => {
    if (!seen.has(message.id)) {
      merged.push(message);
    }
  });

  return merged.sort(
    (first, second) => new Date(first.sentAtUtc).getTime() - new Date(second.sentAtUtc).getTime()
  );
};

const ConversationChatThread = ({
  conversationId,
  active = true,
  readOnly = false,
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
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const allMessagesRef = useRef<ChatMessage[]>([]);
  const visibleStartIndexRef = useRef(0);
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
  const useScrollWindow = isFull || isMobileFull;
  const rootClassName = [
    styles.thread,
    isFull ? styles.threadFull : "",
    isMobileFull ? styles.threadMobileFull : "",
  ]
    .filter(Boolean)
    .join(" ");

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

  const applyVisibleWindow = useCallback(
    (startIndex: number, allMessages: ChatMessage[]) => {
      visibleStartIndexRef.current = startIndex;
      setHasMoreOlder(startIndex > 0);
      setMessages(allMessages.slice(startIndex));
    },
    []
  );

  const showLatestWindow = useCallback(
    (allMessages: ChatMessage[]) => {
      const startIndex = useScrollWindow
        ? Math.max(0, allMessages.length - MESSAGE_WINDOW_SIZE)
        : 0;
      applyVisibleWindow(startIndex, allMessages);
    },
    [applyVisibleWindow, useScrollWindow]
  );

  const loadOlderMessages = useCallback(() => {
    if (isLoadingOlderRef.current || !hasMoreOlder || visibleStartIndexRef.current <= 0) {
      return;
    }

    const container = messagesContainerRef.current;
    if (!container || container.scrollHeight <= container.clientHeight) {
      return;
    }

    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;
    const newStart = Math.max(0, visibleStartIndexRef.current - MESSAGE_WINDOW_SIZE);

    isLoadingOlderRef.current = true;
    setIsLoadingOlder(true);

    applyVisibleWindow(newStart, allMessagesRef.current);

    requestAnimationFrame(() => {
      const nextContainer = messagesContainerRef.current;
      if (nextContainer) {
        const heightDelta = nextContainer.scrollHeight - previousScrollHeight;
        nextContainer.scrollTop = previousScrollTop + heightDelta;
      }

      isLoadingOlderRef.current = false;
      setIsLoadingOlder(false);
    });
  }, [applyVisibleWindow, hasMoreOlder]);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || !useScrollWindow) {
      return;
    }

    if (
      container.scrollTop < NEAR_EDGE_THRESHOLD_PX &&
      container.scrollHeight > container.clientHeight
    ) {
      loadOlderMessages();
    }
  }, [loadOlderMessages, useScrollWindow]);

  const appendIncomingMessages = useCallback(
    (incoming: ChatMessage[], shouldScrollToBottom: boolean) => {
      allMessagesRef.current = mergeMessages(allMessagesRef.current, incoming);

      if (!useScrollWindow) {
        setMessages(allMessagesRef.current);
        if (shouldScrollToBottom) {
          requestAnimationFrame(() => scrollToBottom("smooth"));
        }
        return;
      }

      if (shouldScrollToBottom) {
        showLatestWindow(allMessagesRef.current);
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }
    },
    [scrollToBottom, showLatestWindow, useScrollWindow]
  );

  useEffect(() => {
    if (!active || !conversationId) {
      return;
    }

    let cancelled = false;

    allMessagesRef.current = [];
    visibleStartIndexRef.current = 0;
    setMessages([]);
    setHasMoreOlder(false);
    setLoadError(false);
    setDraftMessage("");
    setIsLoading(true);

    const loadInitialMessages = async () => {
      try {
        const messagesResponse = await GetChatMessages(conversationId);
        if (cancelled) {
          return;
        }

        allMessagesRef.current = messagesResponse.data;
        showLatestWindow(allMessagesRef.current);

        await MarkChatConversationRead(conversationId);
        if (cancelled) {
          return;
        }

        onMessagesChangeRef.current?.();

        requestAnimationFrame(() => scrollToBottom("auto"));
      } catch {
        if (!cancelled) {
          setLoadError(true);
          allMessagesRef.current = [];
          setMessages([]);
          setHasMoreOlder(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialMessages();

    return () => {
      cancelled = true;
    };
  }, [active, conversationId, scrollToBottom, showLatestWindow]);

  useEffect(() => {
    if (!active || !conversationId) {
      return;
    }

    void joinConversation(conversationId);

    const unsubscribe = subscribeChatMessages((incomingConversationId, message) => {
      if (incomingConversationId !== conversationId) {
        return;
      }

      const container = messagesContainerRef.current;
      const shouldAutoScroll = container ? isNearBottom(container) : true;
      appendIncomingMessages([message], shouldAutoScroll);
    });

    return () => {
      unsubscribe();
      void leaveConversation(conversationId);
    };
  }, [active, appendIncomingMessages, conversationId, isNearBottom]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage || isSending || readOnly) {
      return;
    }

    setIsSending(true);
    try {
      const response = await SendChatMessage(conversationId, trimmedMessage);
      appendIncomingMessages([response.data], true);
      setDraftMessage("");
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
          <div
            ref={messagesContainerRef}
            className={styles.messages}
            onScroll={handleMessagesScroll}
          >
            {isLoadingOlder ? (
              <div className={styles.topLoader} role="status" aria-live="polite">
                {t("chat.loadingOlder")}
              </div>
            ) : null}
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
