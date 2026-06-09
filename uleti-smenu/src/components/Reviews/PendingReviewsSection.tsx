import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { PendingReview } from "../../models/Review.model";
import { GetMyPendingReviews, SubmitReview } from "../../services/review-service";
import styles from "./PendingReviewsSection.module.scss";

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

const PendingReviewsSection = () => {
  const { t } = useTranslation();
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadPendingReviews = async () => {
    setIsLoading(true);
    try {
      const response = await GetMyPendingReviews();
      setPendingReviews(response.data);
    } catch {
      toast.error(t("reviews.failedLoadPending"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPendingReviews();
  }, []);

  const handleSubmit = async (event: FormEvent, pendingReview: PendingReview) => {
    event.preventDefault();

    const rating = ratings[pendingReview.applicationId] ?? 0;
    if (rating < 1) {
      toast.error(t("reviews.ratingRequired"));
      return;
    }

    setSubmittingId(pendingReview.applicationId);
    try {
      await SubmitReview({
        applicationId: pendingReview.applicationId,
        rating,
        comment: comments[pendingReview.applicationId]?.trim() || undefined,
      });
      setPendingReviews((previous) =>
        previous.filter((item) => item.applicationId !== pendingReview.applicationId)
      );
      toast.success(t("reviews.submitSuccess"));
    } catch {
      toast.error(t("reviews.submitError"));
    } finally {
      setSubmittingId(null);
      setActiveApplicationId(null);
    }
  };

  if (isLoading) {
    return <p className={styles.mutedText}>{t("common.loading")}</p>;
  }

  if (pendingReviews.length === 0) {
    return <p className={styles.mutedText}>{t("reviews.noPending")}</p>;
  }

  return (
    <div className={styles.section}>
      {pendingReviews.map((pendingReview) => {
        const isOpen = activeApplicationId === pendingReview.applicationId;
        return (
          <article key={pendingReview.applicationId} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h4>{pendingReview.jobPostTitle}</h4>
                <p className={styles.meta}>
                  {t("reviews.reviewing")}: {pendingReview.revieweeName}
                </p>
                <p className={styles.meta}>
                  {t("employeeProfile.shiftDate")}: {new Date(pendingReview.shiftDate).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() =>
                  setActiveApplicationId((previous) =>
                    previous === pendingReview.applicationId ? null : pendingReview.applicationId
                  )
                }
              >
                {isOpen ? t("reviews.hideForm") : t("reviews.leaveReview")}
              </button>
            </div>

            {isOpen && (
              <form className={styles.form} onSubmit={(event) => void handleSubmit(event, pendingReview)}>
                <fieldset className={styles.ratingFieldset}>
                  <legend>{t("reviews.rating")}</legend>
                  <div className={styles.ratingOptions}>
                    {RATING_OPTIONS.map((value) => (
                      <label key={value} className={styles.ratingOption}>
                        <input
                          type="radio"
                          name={`rating-${pendingReview.applicationId}`}
                          value={value}
                          checked={(ratings[pendingReview.applicationId] ?? 0) === value}
                          onChange={() =>
                            setRatings((previous) => ({
                              ...previous,
                              [pendingReview.applicationId]: value,
                            }))
                          }
                        />
                        <span>{value} ★</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className={styles.commentLabel}>
                  {t("reviews.comment")}
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    maxLength={1000}
                    value={comments[pendingReview.applicationId] ?? ""}
                    onChange={(event) =>
                      setComments((previous) => ({
                        ...previous,
                        [pendingReview.applicationId]: event.target.value,
                      }))
                    }
                    placeholder={t("reviews.commentPlaceholder")}
                  />
                </label>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submittingId === pendingReview.applicationId}
                >
                  {submittingId === pendingReview.applicationId
                    ? t("reviews.submitting")
                    : t("reviews.submit")}
                </button>
              </form>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default PendingReviewsSection;
