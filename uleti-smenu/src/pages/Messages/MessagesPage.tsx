import { useCallback, useContext, useEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConversationChatThread from "../../components/Chat/ConversationChatThread";
import ChatContactAvatar from "../../components/Chat/ChatContactAvatar";
import ConversationListPanel from "../../components/Messages/ConversationListPanel";
import CandidatePageHeader from "../../components/Candidate/CandidatePageHeader";
import { useChatConversations } from "../../hooks/useChatConversations";
import { useIsCandidateShell } from "../../hooks/useIsCandidateShell";
import { useIsEmployerShell } from "../../hooks/useIsEmployerShell";
import { AuthContext } from "../../store/Auth-context";
import styles from "./MessagesPage.module.scss";

const MessagesPage = () => {
  const { t } = useTranslation();
  const { authStatus } = useContext(AuthContext);
  const isCandidateShell = useIsCandidateShell();
  const isEmployerShell = useIsEmployerShell();
  const isMobile = useMediaQuery("(max-width:1023px)");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationQuery = searchParams.get("c");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const {
    conversations,
    isLoading,
    loadError,
    loadConversations,
    resolveContactPhoto,
  } = useChatConversations();

  useEffect(() => {
    if (isMobile || conversations.length === 0) {
      return;
    }

    if (
      conversationQuery &&
      conversations.some((conversation) => conversation.conversationId === conversationQuery)
    ) {
      setSelectedConversationId(conversationQuery);
      return;
    }

    setSelectedConversationId((previousSelection) => {
      if (
        previousSelection &&
        conversations.some((conversation) => conversation.conversationId === previousSelection)
      ) {
        return previousSelection;
      }

      return conversations[0]?.conversationId ?? null;
    });
  }, [conversationQuery, conversations, isMobile]);

  const handleSelectConversation = (conversationId: string) => {
    if (isMobile) {
      navigate(`/messages/${conversationId}`);
      return;
    }

    setSelectedConversationId(conversationId);
    setSearchParams({ c: conversationId }, { replace: true });
  };

  const selectedConversation = conversations.find(
    (conversation) => conversation.conversationId === selectedConversationId
  );
  const selectedContactPhoto = selectedConversation
    ? resolveContactPhoto(selectedConversation)
    : undefined;

  const handleMessagesChange = useCallback(() => {
    void loadConversations();
  }, [loadConversations]);

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  return (
    <div className={`${styles.page} ${isMobile ? styles.pageMobile : styles.pageDesktop}`}>
      <div className={styles.pageHeader}>
        {isCandidateShell ? (
          <CandidatePageHeader
            title={t("candidate.messagesTitle")}
            subtitle={t("candidate.messagesSubtitle")}
            dense={isMobile}
          />
        ) : isEmployerShell ? (
          <CandidatePageHeader
            title={t("employerShell.messagesTitle")}
            subtitle={t("employerShell.messagesSubtitle")}
            dense={isMobile}
          />
        ) : (
          <h1 className={styles.title}>{t("messages.title")}</h1>
        )}
      </div>

      {isLoading && <p className={styles.mutedText}>{t("messages.loading")}</p>}
      {loadError && !isLoading && <p className={styles.mutedText}>{t("messages.loadError")}</p>}

      {!isLoading && !loadError && conversations.length === 0 && (
        <p className={styles.mutedText}>{t("messages.noConversations")}</p>
      )}

      {!isLoading && !loadError && conversations.length > 0 && isMobile && (
        <ConversationListPanel
          conversations={conversations}
          resolveContactPhoto={resolveContactPhoto}
          onSelect={handleSelectConversation}
          variant="mobile"
        />
      )}

      {!isLoading && !loadError && conversations.length > 0 && !isMobile && (
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <ConversationListPanel
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              resolveContactPhoto={resolveContactPhoto}
              onSelect={handleSelectConversation}
              variant="sidebar"
            />
          </aside>

          <section className={styles.threadPanel}>
            {selectedConversation ? (
              <>
                <div className={styles.threadHeader}>
                  <div className={styles.threadHeaderMain}>
                    <ChatContactAvatar
                      name={selectedConversation.otherPartyName}
                      profilePhoto={selectedContactPhoto}
                      size="md"
                    />
                    <div>
                      <h2>{selectedConversation.otherPartyName}</h2>
                      <p>{selectedConversation.jobPostTitle}</p>
                    </div>
                  </div>
                </div>
                <ConversationChatThread
                  key={selectedConversation.conversationId}
                  conversationId={selectedConversation.conversationId}
                  otherPartyName={selectedConversation.otherPartyName}
                  otherPartyProfilePhoto={selectedContactPhoto}
                  active
                  variant="full"
                  onMessagesChange={handleMessagesChange}
                />
              </>
            ) : (
              <p className={`${styles.mutedText} ${styles.emptyState}`}>{t("messages.selectConversation")}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
