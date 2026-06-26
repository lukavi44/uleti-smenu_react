import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { Applicant } from "../../models/Application.model";
import { ChatConversation } from "../../models/Chat.model";
import {
  GetApplicantsForJobPost,
  UpdateApplicationStatus,
} from "../../services/application-service";
import { GetChatConversationByApplication, GetMyChatConversations } from "../../services/chat-service";
import {
  canEmployerDecideOnApplication,
  getApplicationStatusLabel,
} from "../../helpers/applicationStatus";
import { getApplicantStatusBadgeVariant } from "../../helpers/employerJobPostMobile";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import ChatContactAvatar from "../Chat/ChatContactAvatar";
import RatingBadge from "../Reviews/RatingBadge";
import styles from "./EmployerJobPostCandidatesList.module.scss";

type EmployerJobPostCandidatesListProps = {
  jobPostId: string;
  variant?: "default" | "desktopPanel";
};

type StatusFilter = "all" | "Applied" | "Accepted" | "Denied";

const EmployerJobPostCandidatesList = ({
  jobPostId,
  variant = "default",
}: EmployerJobPostCandidatesListProps) => {
  const isDesktopPanel = variant === "desktopPanel";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [messagePreviews, setMessagePreviews] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    const loadApplicants = async () => {
      setIsLoading(true);
      try {
        const [applicantsResponse, conversationsResponse] = await Promise.all([
          GetApplicantsForJobPost(jobPostId),
          GetMyChatConversations().catch(() => ({ data: [] as ChatConversation[] })),
        ]);

        setApplicants(applicantsResponse.data);

        const previews = Object.fromEntries(
          conversationsResponse.data
            .filter((conversation) => conversation.applicationId && conversation.lastMessagePreview)
            .map((conversation) => [conversation.applicationId, conversation.lastMessagePreview!])
        );
        setMessagePreviews(previews);
      } catch {
        toast.error(t("applicants.loadError"));
        setApplicants([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplicants();
  }, [jobPostId, t]);

  const filteredApplicants = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return applicants.filter((applicant) => {
      if (statusFilter !== "all" && applicant.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${applicant.firstName} ${applicant.lastName} ${applicant.city ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [applicants, searchQuery, statusFilter]);

  const handleDecision = async (applicationId: string, status: "Accepted" | "Denied") => {
    const actionKey = `${applicationId}:${status}`;
    setActiveAction(actionKey);
    try {
      await UpdateApplicationStatus(applicationId, status);
      setApplicants((previousApplicants) =>
        previousApplicants.map((applicant) =>
          applicant.applicationId === applicationId ? { ...applicant, status } : applicant
        )
      );
      toast.success(status === "Accepted" ? t("applicants.accepted") : t("applicants.rejected"));
    } catch {
      toast.error(t("applicants.updateError"));
    } finally {
      setActiveAction(null);
    }
  };

  const handleSendMessage = async (applicationId: string) => {
    try {
      const response = await GetChatConversationByApplication(applicationId);
      navigate(`/messages/${response.data.conversationId}`);
    } catch {
      toast.error(t("chat.loadError"));
    }
  };

  const formatAppliedAt = (value: string) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return `${formatDisplayDate(value)} ${parsedDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getStatusLabel = (status: string) => {
    if (status === "Accepted") return t("applicants.finalAccepted");
    if (status === "Denied") return t("applicants.finalDeclined");
    if (status === "Applied") return t("jobPosts.candidateStatusPending");
    return getApplicationStatusLabel(status, t).toUpperCase();
  };

  return (
    <div className={isDesktopPanel ? styles.panelDesktop : styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.searchField}>
          <MagnifyingGlassIcon className={styles.searchIcon} aria-hidden />
          <input
            type="text"
            inputMode="search"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("jobPosts.searchCandidatesPlaceholder")}
            aria-label={t("jobPosts.searchCandidatesPlaceholder")}
          />
        </div>
        <button
          type="button"
          className={`${styles.filterButton} ${showFilters ? styles.filterButtonActive : ""}`}
          onClick={() => setShowFilters((value) => !value)}
        >
          <FunnelIcon className={styles.filterIcon} aria-hidden />
          <span>{t("jobPosts.filters")}</span>
        </button>
      </div>

      {showFilters && (
        <div className={styles.filterRow}>
          {(["all", "Applied", "Accepted", "Denied"] as StatusFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.filterChip} ${statusFilter === value ? styles.filterChipActive : ""}`}
              onClick={() => setStatusFilter(value)}
            >
              {value === "all"
                ? t("jobPosts.all")
                : value === "Applied"
                  ? t("jobPosts.candidateStatusPending")
                  : value === "Accepted"
                    ? t("applicants.finalAccepted")
                    : t("applicants.finalDeclined")}
            </button>
          ))}
        </div>
      )}

      {!isDesktopPanel && (
        <p className={styles.summary}>
          {t("jobPosts.shownCandidatesCount", { count: filteredApplicants.length })}
        </p>
      )}

      {isLoading && <p className={styles.muted}>{t("applicants.loading")}</p>}
      {!isLoading && filteredApplicants.length === 0 && (
        <p className={styles.muted}>{t("applicants.none")}</p>
      )}

      <div className={styles.list}>
        {filteredApplicants.map((applicant) => {
          const statusVariant = getApplicantStatusBadgeVariant(applicant.status);
          const messagePreview = messagePreviews[applicant.applicationId];
          const isPending = canEmployerDecideOnApplication(applicant.status);
          const isAccepted = applicant.status === "Accepted";

          return (
            <article key={applicant.applicationId} className={styles.card}>
              <div className={styles.cardMain}>
                <Link
                  to={`/employees/${applicant.userId}`}
                  className={styles.avatarLink}
                  aria-label={`${applicant.firstName} ${applicant.lastName}`}
                >
                  <div className={styles.avatarWrap}>
                    <ChatContactAvatar
                      name={`${applicant.firstName} ${applicant.lastName}`}
                      profilePhoto={applicant.profilePhoto}
                      size="md"
                    />
                    <span
                      className={`${styles.onlineDot} ${isAccepted ? styles.onlineDotActive : styles.onlineDotIdle}`}
                      aria-hidden
                    />
                  </div>
                </Link>

                <Link to={`/employees/${applicant.userId}`} className={styles.cardBodyLink}>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <strong>
                        {applicant.firstName} {applicant.lastName}
                      </strong>
                      <span
                        className={`${styles.statusBadge} ${styles[`statusBadge${statusVariant}`]}`}
                      >
                        {getStatusLabel(applicant.status)}
                      </span>
                    </div>

                    <div className={styles.ratingRow}>
                      <RatingBadge
                        averageRating={applicant.averageRating}
                        reviewCount={applicant.reviewCount}
                        compact
                        subjectType="employee"
                        subjectId={applicant.userId}
                      />
                    </div>

                    {applicant.city && <p className={styles.location}>{applicant.city}</p>}

                    <p className={styles.meta}>
                      {t("applicants.appliedAt")}: {formatAppliedAt(applicant.appliedAt)}
                    </p>

                    {messagePreview && (
                      <p className={styles.messagePreview}>
                        {t("jobPosts.messagePreview")}: {messagePreview}
                      </p>
                    )}
                  </div>
                </Link>

                <Link
                  to={`/employees/${applicant.userId}`}
                  className={styles.chevronLink}
                  aria-label={`${applicant.firstName} ${applicant.lastName}`}
                >
                  <ChevronRightIcon className={styles.chevron} aria-hidden />
                </Link>
              </div>

              {isPending && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.acceptButton}`}
                    disabled={activeAction !== null}
                    onClick={() => void handleDecision(applicant.applicationId, "Accepted")}
                  >
                    <CheckIcon className={styles.actionIcon} aria-hidden />
                    {activeAction === `${applicant.applicationId}:Accepted`
                      ? t("applicants.accepting")
                      : t("applicants.accept")}
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.rejectButton}`}
                    disabled={activeAction !== null}
                    onClick={() => void handleDecision(applicant.applicationId, "Denied")}
                  >
                    <XMarkIcon className={styles.actionIcon} aria-hidden />
                    {activeAction === `${applicant.applicationId}:Denied`
                      ? t("applicants.rejecting")
                      : t("applicants.reject")}
                  </button>
                </div>
              )}

              {isAccepted && isDesktopPanel && (
                <div className={styles.desktopAcceptedActions}>
                  <button
                    type="button"
                    className={styles.messageButton}
                    onClick={() => void handleSendMessage(applicant.applicationId)}
                  >
                    {t("jobPosts.sendMessage")}
                  </button>
                  <Link
                    to={`/employees/${applicant.userId}`}
                    className={styles.viewProfileButton}
                  >
                    {t("jobPosts.viewProfile")}
                  </Link>
                </div>
              )}

              {isAccepted && !isDesktopPanel && (
                <button
                  type="button"
                  className={styles.messageButton}
                  onClick={() => void handleSendMessage(applicant.applicationId)}
                >
                  {t("jobPosts.sendMessage")}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {!isDesktopPanel && (
        <p className={styles.privacyNote}>{t("jobPosts.candidatePrivacyNote")}</p>
      )}
    </div>
  );
};

export default EmployerJobPostCandidatesList;
