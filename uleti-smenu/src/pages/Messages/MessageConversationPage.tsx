import { useCallback, useContext, useMemo } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import ConversationChatThread from "../../components/Chat/ConversationChatThread";
import ChatContactAvatar from "../../components/Chat/ChatContactAvatar";
import { useChatConversations } from "../../hooks/useChatConversations";
import { getChatOtherPartyProfilePath } from "../../helpers/chatOtherPartyProfilePath";
import { AuthContext } from "../../store/Auth-context";
import styles from "./MessageConversationPage.module.scss";

const MessageConversationPage = () => {
  const { t } = useTranslation();
  const { authStatus, role } = useContext(AuthContext);
  const { conversationId } = useParams<{ conversationId: string }>();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:1023px)");

  const activeConversations = useChatConversations("active");
  const archivedConversations = useChatConversations("archived");

  const conversation = useMemo(() => {
    if (!conversationId) return undefined;

    if (tab === "archived") {
      return archivedConversations.conversations.find(
        (item) => item.conversationId === conversationId
      );
    }

    return (
      activeConversations.conversations.find((item) => item.conversationId === conversationId) ??
      archivedConversations.conversations.find((item) => item.conversationId === conversationId)
    );
  }, [
    activeConversations.conversations,
    archivedConversations.conversations,
    conversationId,
    tab,
  ]);

  const isLoading = activeConversations.isLoading || archivedConversations.isLoading;
  const loadError = activeConversations.loadError && archivedConversations.loadError;

  const loadConversations = useCallback(() => {
    void activeConversations.loadConversations();
    void archivedConversations.loadConversations();
  }, [activeConversations, archivedConversations]);

  const handleMessagesChange = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  const resolveContactPhoto = useCallback(
    (conv: NonNullable<typeof conversation>) => {
      if (activeConversations.getConversationById(conv.conversationId)) {
        return activeConversations.resolveContactPhoto(conv);
      }
      return archivedConversations.resolveContactPhoto(conv);
    },
    [activeConversations, archivedConversations]
  );

  if (!isMobile) {
    const query = new URLSearchParams();
    if (conversationId) query.set("c", conversationId);
    if (tab) query.set("tab", tab);
    const suffix = query.toString();
    return <Navigate to={suffix ? `/messages?${suffix}` : "/messages"} replace />;
  }

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  const contactPhoto = conversation ? resolveContactPhoto(conversation) : undefined;
  const otherPartyProfilePath = conversation
    ? getChatOtherPartyProfilePath(conversation, role)
    : undefined;
  const readOnly = conversation
    ? conversation.isReadOnly || !conversation.canSendMessages
    : false;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          aria-label={t("messages.backToList")}
          onClick={() => navigate(tab === "archived" ? "/messages?tab=archived" : "/messages")}
        >
          <ArrowLeftIcon className={styles.backIcon} aria-hidden />
        </button>

        {conversation ? (
          <div className={styles.headerMain}>
            <ChatContactAvatar
              name={conversation.otherPartyName}
              profilePhoto={contactPhoto}
              size="md"
              to={otherPartyProfilePath}
              ariaLabel={t("messages.viewProfile", { name: conversation.otherPartyName })}
            />
            <div className={styles.headerText}>
              {otherPartyProfilePath ? (
                <Link to={otherPartyProfilePath} className={styles.profileNameLink}>
                  <strong>{conversation.otherPartyName}</strong>
                </Link>
              ) : (
                <strong>{conversation.otherPartyName}</strong>
              )}
              <span>{conversation.jobPostTitle}</span>
              {(conversation.restaurantLocationName || conversation.restaurantLocationCity) && (
                <span className={styles.locationLine}>
                  {[conversation.restaurantLocationName, conversation.restaurantLocationCity]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
              {conversation.status === "Archived" ? (
                <span className={styles.archivedBadge}>{t("messages.archivedBadge")}</span>
              ) : (
                <span className={styles.status}>
                  <span className={styles.statusDot} aria-hidden />
                  {t("messages.online")}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.headerMain}>
            <strong>{t("messages.title")}</strong>
          </div>
        )}

        <button
          type="button"
          className={styles.menuButton}
          aria-label={t("messages.conversationMenu")}
        >
          <EllipsisVerticalIcon className={styles.menuIcon} aria-hidden />
        </button>
      </header>

      {isLoading && <p className={styles.mutedText}>{t("chat.loading")}</p>}
      {loadError && !isLoading && <p className={styles.mutedText}>{t("chat.loadError")}</p>}
      {!isLoading && !loadError && !conversation && (
        <p className={styles.mutedText}>{t("messages.conversationNotFound")}</p>
      )}

      {conversation && conversationId && (
        <div className={styles.threadHost}>
          <ConversationChatThread
            key={conversationId}
            conversationId={conversationId}
            otherPartyName={conversation.otherPartyName}
            otherPartyProfilePhoto={contactPhoto}
            otherPartyProfilePath={otherPartyProfilePath}
            active
            readOnly={readOnly}
            variant="mobileFull"
            onMessagesChange={handleMessagesChange}
          />
        </div>
      )}
    </div>
  );
};

export default MessageConversationPage;
