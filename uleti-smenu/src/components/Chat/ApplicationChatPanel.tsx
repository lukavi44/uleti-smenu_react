import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatConversation } from "../../models/Chat.model";
import { GetChatConversationByApplication } from "../../services/chat-service";
import ConversationChatThread from "./ConversationChatThread";
import styles from "./ApplicationChatPanel.module.scss";

interface ApplicationChatPanelProps {
  applicationId: string;
  enabled: boolean;
}

const ApplicationChatPanel = ({ applicationId, enabled }: ApplicationChatPanelProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!enabled || !isOpen) {
      return;
    }

    const loadConversation = async () => {
      setIsLoading(true);
      setLoadError(false);

      try {
        const conversationResponse = await GetChatConversationByApplication(applicationId);
        setConversation(conversationResponse.data);
      } catch {
        setLoadError(true);
        setConversation(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadConversation();
  }, [enabled, isOpen, applicationId]);

  if (!enabled) {
    return null;
  }

  return (
    <div className={styles.chatPanel}>
      <button type="button" className={styles.toggleButton} onClick={() => setIsOpen((previous) => !previous)}>
        {isOpen ? t("chat.hideChat") : t("chat.openChat")}
      </button>

      {isOpen && (
        <div className={styles.chatBody}>
          {isLoading && <p className={styles.mutedText}>{t("chat.loading")}</p>}
          {loadError && !isLoading && <p className={styles.mutedText}>{t("chat.loadError")}</p>}
          {!isLoading && !loadError && conversation && (
            <ConversationChatThread
              conversationId={conversation.conversationId}
              otherPartyName={conversation.otherPartyName}
              otherPartyProfilePhoto={conversation.otherPartyProfilePhoto}
              active={isOpen}
              variant="embedded"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationChatPanel;
