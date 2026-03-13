import { useState } from "react";
import { toast } from "react-toastify";
import { Applicant } from "../../models/Application.model";
import { GetApplicantsForJobPost, UpdateApplicationStatus } from "../../services/application-service";
import styles from "./EmployerApplicantsPanel.module.scss";
import { useTranslation } from "react-i18next";

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

  return (
    <div className={`${styles.wrapper} ${variant === "inlineCard" ? styles.inlineCardWrapper : ""}`}>
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
                  <p className={styles.name}>
                    {applicant.firstName} {applicant.lastName}
                  </p>
                  <p className={styles.meta}>{applicant.email} | {applicant.phoneNumber}</p>
                  <p className={styles.meta}>{t("applicants.appliedAt")}: {formatDate(applicant.appliedAt)}</p>
                  <p className={styles.meta}>{t("applicants.status")}: {applicant.status}</p>
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
                      onClick={() => handleDecision(applicant.applicationId, "Denied")}
                    >
                      {activeAction === `${applicant.applicationId}:Denied` ? t("applicants.rejecting") : t("applicants.reject")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployerApplicantsPanel;
