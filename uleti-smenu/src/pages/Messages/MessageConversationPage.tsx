import { useContext } from "react";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ConversationChatThread from "../../components/Chat/ConversationChatThread";
import ChatContactAvatar from "../../components/Chat/ChatContactAvatar";
import { useChatConversations } from "../../hooks/useChatConversations";
import { AuthContext } from "../../store/Auth-context";
import styles from "./MessageConversationPage.module.scss";

const MessageConversationPage = () => {
  const { t } = useTranslation();
  const { authStatus } = useContext(AuthContext);
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:1023px)");

  const {
    isLoading,
    loadError,
    loadConversations,
    resolveContactPhoto,
    getConversationById,
  } = useChatConversations();

  if (!isMobile) {
    return <Navigate to={`/messages?c=${conversationId ?? ""}`} replace />;
  }

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  const conversation = conversationId ? getConversationById(conversationId) : undefined;
  const contactPhoto = conversation ? resolveContactPhoto(conversation) : undefined;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          aria-label={t("messages.backToList")}
          onClick={() => navigate("/messages")}
        >
          <ArrowLeftIcon className={styles.backIcon} aria-hidden />
        </button>

        {conversation ? (
          <div className={styles.headerMain}>
            <ChatContactAvatar
              name={conversation.otherPartyName}
              profilePhoto={contactPhoto}
              size="md"
            />
            <div className={styles.headerText}>
              <strong>{conversation.otherPartyName}</strong>
              <span>{conversation.jobPostTitle}</span>
              <span className={styles.status}>
                <span className={styles.statusDot} aria-hidden />
                {t("messages.online")}
              </span>
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
            active
            variant="mobileFull"
            onMessagesChange={() => void loadConversations()}
          />
        </div>
      )}
    </div>
  );
};

export default MessageConversationPage;
