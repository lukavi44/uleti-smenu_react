import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ChatContactAvatar from "../Chat/ChatContactAvatar";
import { ChatConversation } from "../../models/Chat.model";
import { formatConversationListTimestamp } from "../../helpers/formatConversationTimestamp";
import styles from "./ConversationListPanel.module.scss";

type ConversationListPanelProps = {
  conversations: ChatConversation[];
  selectedConversationId?: string | null;
  resolveContactPhoto: (conversation: ChatConversation) => string | undefined;
  onSelect: (conversationId: string) => void;
  variant?: "sidebar" | "mobile";
};

const ConversationListPanel = ({
  conversations,
  selectedConversationId,
  resolveContactPhoto,
  onSelect,
  variant = "sidebar",
}: ConversationListPanelProps) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return conversations.filter((conversation) => {
      if (!normalizedQuery) return true;

      const haystack = [
        conversation.otherPartyName,
        conversation.jobPostTitle,
        conversation.restaurantLocationName ?? "",
        conversation.restaurantLocationCity ?? "",
        conversation.lastMessagePreview ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [conversations, searchQuery]);

  return (
    <div className={`${styles.panel} ${variant === "mobile" ? styles.panelMobile : ""}`}>
      {variant === "mobile" && (
        <div className={styles.searchField}>
          <MagnifyingGlassIcon className={styles.searchIcon} aria-hidden />
          <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("messages.searchPlaceholder")}
            aria-label={t("messages.searchPlaceholder")}
          />
        </div>
      )}

      <div className={styles.list}>
        {filteredConversations.length === 0 && (
          <p className={styles.empty}>{t("messages.noSearchResults")}</p>
        )}

        {filteredConversations.map((conversation) => {
          const isSelected = conversation.conversationId === selectedConversationId;
          const contactPhoto = resolveContactPhoto(conversation);

          return (
            <button
              key={conversation.conversationId}
              type="button"
              className={`${styles.row} ${isSelected ? styles.rowActive : ""}`}
              onClick={() => onSelect(conversation.conversationId)}
            >
              <ChatContactAvatar
                name={conversation.otherPartyName}
                profilePhoto={contactPhoto}
                size="md"
              />

              <div className={styles.rowBody}>
                <div className={styles.rowTop}>
                  <strong>{conversation.otherPartyName}</strong>
                  <span className={styles.timestamp}>
                    {formatConversationListTimestamp(
                      conversation.lastMessageAtUtc,
                      i18n.language
                    )}
                  </span>
                </div>
                <p className={styles.jobTitle}>{conversation.jobPostTitle}</p>
                {(conversation.restaurantLocationName || conversation.restaurantLocationCity) && (
                  <p className={styles.location}>
                    {[conversation.restaurantLocationName, conversation.restaurantLocationCity]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                <p className={styles.preview}>
                  {conversation.lastMessagePreview || t("messages.noPreview")}
                </p>
              </div>

              <div className={styles.rowMeta}>
                {conversation.status === "Archived" && (
                  <span className={styles.archivedBadge}>{t("messages.archivedBadge")}</span>
                )}
                {conversation.unreadCount > 0 && (
                  <span
                    className={styles.unreadBadge}
                    aria-label={t("messages.unreadCount", { count: conversation.unreadCount })}
                  >
                    {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationListPanel;
