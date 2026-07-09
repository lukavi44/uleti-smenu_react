import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Applicant } from "../../models/Application.model";
import RatingBadge from "../Reviews/RatingBadge";
import ChatContactAvatar from "../Chat/ChatContactAvatar";
import { GetApplicantsForJobPost, UpdateApplicationStatus } from "../../services/application-service";
import styles from "./EmployerApplicantsPanel.module.scss";
import { useTranslation } from "react-i18next";
import {
  canEmployerDecideOnApplication,
  getApplicationStatusLabel,
} from "../../helpers/applicationStatus";
import ConfirmActionDialog from "../Dialog/ConfirmActionDialog";

interface EmployerApplicantsPanelProps {
  jobPostId: string;
  variant?: "default" | "inlineCard";
}

const EmployerApplicantsPanel = ({ jobPostId, variant = "default" }: EmployerApplicantsPanelProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [pendingRejectApplicationId, setPendingRejectApplicationId] = useState<string | null>(null);

  const loadApplicants = async () => {
    setIsLoading(true);
    try {
      const response = await GetApplicantsForJobPost(jobPostId);
      setApplicants(response.data);
    } catch {
      toast.error(t("applicants.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleApplicants = async () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState) {
      await loadApplicants();
    }
  };

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

  const formatDate = (value: string) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }
    return parsedDate.toLocaleString();
  };

  const getFinalStatusLabel = (status: string) => {
    if (status === "Accepted") {
      return t("applicants.finalAccepted");
    }

    if (status === "Denied") {
      return t("applicants.finalDeclined");
    }

    if (status === "Expired") {
      return t("applicants.finalExpired");
    }

    if (status === "Cancelled") {
      return t("common.cancel").toUpperCase();
    }

    return getApplicationStatusLabel(status, t).toUpperCase();
  };

  return (
    <div
      className={`${styles.wrapper} ${variant === "inlineCard" ? styles.inlineCardWrapper : ""}`}
      data-applicants-open={variant === "inlineCard" && isExpanded ? "true" : undefined}
    >
      <button
        className={`${styles.toggleButton} ${variant === "inlineCard" ? styles.inlineCardToggleButton : ""}`}
        onClick={toggleApplicants}
      >
        {isExpanded ? t("applicants.hideApplicants") : t("applicants.seeApplicants")}
      </button>

      {isExpanded && (
        <div className={`${styles.panel} ${variant === "inlineCard" ? styles.inlineCardPanel : ""}`}>
          {isLoading && <p className={styles.mutedText}>{t("applicants.loading")}</p>}
          {!isLoading && applicants.length === 0 && (
            <p className={styles.mutedText}>{t("applicants.none")}</p>
          )}
          {!isLoading && applicants.length > 0 && (
            <div className={styles.applicantList}>
              {applicants.map((applicant) => (
                <div key={applicant.applicationId} className={styles.applicantRow}>
                  <Link
                    to={`/employees/${applicant.userId}`}
                    className={styles.applicantAvatarLink}
                    aria-label={`${applicant.firstName} ${applicant.lastName}`}
                  >
                    <ChatContactAvatar
                      name={`${applicant.firstName} ${applicant.lastName}`}
                      profilePhoto={applicant.profilePhoto}
                      size="sm"
                    />
                  </Link>
                  <div className={styles.applicantContent}>
                  <p className={styles.name}>
                    <Link className={styles.profileLink} to={`/employees/${applicant.userId}`}>
                      {applicant.firstName} {applicant.lastName}
                    </Link>{" "}
                    <RatingBadge
                      averageRating={applicant.averageRating}
                      reviewCount={applicant.reviewCount}
                      compact
                      subjectType="employee"
                      subjectId={applicant.userId}
                    />
                  </p>
                  <p className={styles.meta}>{t("applicants.appliedAt")}: {formatDate(applicant.appliedAt)}</p>
                  <p className={styles.meta}>
                    {t("applicants.status")}:{" "}
                    {canEmployerDecideOnApplication(applicant.status)
                      ? t("jobPosts.appliedShort")
                      : getFinalStatusLabel(applicant.status)}
                  </p>
                  {canEmployerDecideOnApplication(applicant.status) ? (
                    <div className={styles.actions}>
                      <button
                        className={`${styles.button} ${styles.acceptButton}`}
                        disabled={activeAction !== null}
                        onClick={() => handleDecision(applicant.applicationId, "Accepted")}
                      >
                        {activeAction === `${applicant.applicationId}:Accepted` ? t("applicants.accepting") : t("applicants.accept")}
                      </button>
                      <button
                        className={`${styles.button} ${styles.rejectButton}`}
                        disabled={activeAction !== null}
                        onClick={() => setPendingRejectApplicationId(applicant.applicationId)}
                      >
                        {activeAction === `${applicant.applicationId}:Denied` ? t("applicants.rejecting") : t("applicants.reject")}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.finalStatusRow}>
                      <span
                        className={`${styles.finalStatusBadge} ${
                          applicant.status === "Accepted"
                            ? styles.acceptedBadge
                            : applicant.status === "Expired"
                              ? styles.expiredBadge
                              : styles.declinedBadge
                        }`}
                      >
                        {getFinalStatusLabel(applicant.status)}
                      </span>
                    </div>
                  )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {pendingRejectApplicationId ? (
        <ConfirmActionDialog
          title={t("applicants.rejectConfirmTitle")}
          message={t("applicants.rejectConfirmMessage")}
          confirmLabel={t("applicants.reject")}
          isLoading={activeAction === `${pendingRejectApplicationId}:Denied`}
          onConfirm={() => void handleDecision(pendingRejectApplicationId, "Denied").finally(() => setPendingRejectApplicationId(null))}
          onClose={() => {
            if (activeAction !== `${pendingRejectApplicationId}:Denied`) {
              setPendingRejectApplicationId(null);
            }
          }}
        />
      ) : null}
    </div>
  );
};

export default EmployerApplicantsPanel;
