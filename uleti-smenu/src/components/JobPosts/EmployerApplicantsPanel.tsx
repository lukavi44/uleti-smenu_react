import { useState } from "react";
import { toast } from "react-toastify";
import { Applicant } from "../../models/Application.model";
import { GetApplicantsForJobPost, UpdateApplicationStatus } from "../../services/application-service";
import styles from "./EmployerApplicantsPanel.module.scss";

interface EmployerApplicantsPanelProps {
  jobPostId: string;
  variant?: "default" | "inlineCard";
}

const EmployerApplicantsPanel = ({ jobPostId, variant = "default" }: EmployerApplicantsPanelProps) => {
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
      toast.error("Unable to load applicants for this post.");
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
      toast.success(status === "Accepted" ? "Applicant accepted." : "Applicant rejected.");
    } catch {
      toast.error("Unable to update applicant status.");
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
        {isExpanded ? "Hide applicants" : "See applicants"}
      </button>

      {isExpanded && (
        <div className={`${styles.panel} ${variant === "inlineCard" ? styles.inlineCardPanel : ""}`}>
          {isLoading && <p className={styles.mutedText}>Loading applicants...</p>}
          {!isLoading && applicants.length === 0 && (
            <p className={styles.mutedText}>No applicants yet for this post.</p>
          )}
          {!isLoading && applicants.length > 0 && (
            <div className={styles.applicantList}>
              {applicants.map((applicant) => (
                <div key={applicant.applicationId} className={styles.applicantRow}>
                  <p className={styles.name}>
                    {applicant.firstName} {applicant.lastName}
                  </p>
                  <p className={styles.meta}>{applicant.email} | {applicant.phoneNumber}</p>
                  <p className={styles.meta}>Applied: {formatDate(applicant.appliedAt)}</p>
                  <p className={styles.meta}>Status: {applicant.status}</p>
                  <div className={styles.actions}>
                    <button
                      className={`${styles.button} ${styles.acceptButton}`}
                      disabled={activeAction !== null}
                      onClick={() => handleDecision(applicant.applicationId, "Accepted")}
                    >
                      {activeAction === `${applicant.applicationId}:Accepted` ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      className={`${styles.button} ${styles.rejectButton}`}
                      disabled={activeAction !== null}
                      onClick={() => handleDecision(applicant.applicationId, "Denied")}
                    >
                      {activeAction === `${applicant.applicationId}:Denied` ? "Rejecting..." : "Reject"}
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
