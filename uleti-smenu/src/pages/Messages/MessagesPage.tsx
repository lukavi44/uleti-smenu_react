import { useCallback, useContext, useEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConversationChatThread from "../../components/Chat/ConversationChatThread";
import ChatContactAvatar from "../../components/Chat/ChatContactAvatar";
import ConversationListPanel from "../../components/Messages/ConversationListPanel";
import CandidatePageHeader from "../../components/Candidate/CandidatePageHeader";
import { useChatConversations } from "../../hooks/useChatConversations";
import { ChatConversationFilter } from "../../services/chat-service";
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
  const tabQuery = searchParams.get("tab");
  const [conversationTab, setConversationTab] = useState<ChatConversationFilter>(
    tabQuery === "archived" ? "archived" : "active"
  );
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const {
    conversations,
    isLoading,
    loadError,
    loadConversations,
    resolveContactPhoto,
  } = useChatConversations(conversationTab);

  useEffect(() => {
    if (tabQuery === "archived" || tabQuery === "active") {
      setConversationTab(tabQuery);
    }
  }, [tabQuery]);

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

  const handleTabChange = (tab: ChatConversationFilter) => {
    setConversationTab(tab);
    setSelectedConversationId(null);
    setSearchParams({ tab }, { replace: true });
  };

  const handleSelectConversation = (conversationId: string) => {
    if (isMobile) {
      navigate(`/messages/${conversationId}?tab=${conversationTab}`);
      return;
    }

    setSelectedConversationId(conversationId);
    setSearchParams({ c: conversationId, tab: conversationTab }, { replace: true });
  };

  const selectedConversation = conversations.find(
    (conversation) => conversation.conversationId === selectedConversationId
  );
  const selectedContactPhoto = selectedConversation
    ? resolveContactPhoto(selectedConversation)
    : undefined;
  const selectedReadOnly = selectedConversation
    ? selectedConversation.isReadOnly || !selectedConversation.canSendMessages
    : false;

  const handleMessagesChange = useCallback(() => {
    void loadConversations();
  }, [loadConversations]);

  const emptyMessage =
    conversationTab === "archived"
      ? t("messages.noArchivedConversations")
      : t("messages.noConversations");

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

      <div className={styles.tabBar} role="tablist" aria-label={t("messages.title")}>
        <button
          type="button"
          role="tab"
          aria-selected={conversationTab === "active"}
          className={`${styles.tabButton} ${conversationTab === "active" ? styles.tabButtonActive : ""}`}
          onClick={() => handleTabChange("active")}
        >
          {t("messages.tabActive")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={conversationTab === "archived"}
          className={`${styles.tabButton} ${conversationTab === "archived" ? styles.tabButtonActive : ""}`}
          onClick={() => handleTabChange("archived")}
        >
          {t("messages.tabArchived")}
        </button>
      </div>

      {isLoading && <p className={styles.mutedText}>{t("messages.loading")}</p>}
      {loadError && !isLoading && <p className={styles.mutedText}>{t("messages.loadError")}</p>}

      {!isLoading && !loadError && conversations.length === 0 && (
        <p className={styles.mutedText}>{emptyMessage}</p>
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
                      {(selectedConversation.restaurantLocationName ||
                        selectedConversation.restaurantLocationCity) && (
                        <p className={styles.locationLine}>
                          {[
                            selectedConversation.restaurantLocationName,
                            selectedConversation.restaurantLocationCity,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {selectedConversation.status === "Archived" && (
                        <span className={styles.archivedBadge}>{t("messages.archivedBadge")}</span>
                      )}
                    </div>
                  </div>
                </div>
                <ConversationChatThread
                  key={selectedConversation.conversationId}
                  conversationId={selectedConversation.conversationId}
                  otherPartyName={selectedConversation.otherPartyName}
                  otherPartyProfilePhoto={selectedContactPhoto}
                  active
                  readOnly={selectedReadOnly}
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
