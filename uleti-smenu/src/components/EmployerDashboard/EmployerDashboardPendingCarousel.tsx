import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useKeenSlider } from "keen-slider/react";
import type { KeenSliderInstance } from "keen-slider";
import { useMediaQuery } from "@mui/material";
import { toast } from "react-toastify";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import "keen-slider/keen-slider.min.css";
import { UpdateApplicationStatus } from "../../services/application-service";
import { PendingApplicantItem } from "../../helpers/employerDashboardPending";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import ChatContactAvatar from "../Chat/ChatContactAvatar";
import styles from "./EmployerDashboardPendingCarousel.module.scss";

type EmployerDashboardPendingCarouselProps = {
  applicants: PendingApplicantItem[];
  isLoading: boolean;
  onApplicantUpdated: (applicationId: string, status: "Accepted" | "Denied") => void;
};

const DESKTOP_SLIDES_PER_VIEW = 3;

const EmployerDashboardPendingCarousel = ({
  applicants,
  isLoading,
  onApplicantUpdated,
}: EmployerDashboardPendingCarouselProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:1023px)");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [canGoNext, setCanGoNext] = useState(false);

  const updateNavState = useCallback((slider: KeenSliderInstance) => {
    const details = slider.track.details;
    setCanGoNext(details.rel < details.maxIdx);
  }, []);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: {
      perView: isMobile ? 1 : DESKTOP_SLIDES_PER_VIEW,
      spacing: isMobile ? 12 : 14,
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
      updateNavState(slider);
    },
    created(slider) {
      updateNavState(slider);
    },
    updated(slider) {
      updateNavState(slider);
    },
  });

  const handleDecision = async (
    applicant: PendingApplicantItem,
    status: "Accepted" | "Denied"
  ) => {
    const actionKey = `${applicant.applicationId}:${status}`;
    setActiveAction(actionKey);

    try {
      await UpdateApplicationStatus(applicant.applicationId, status);
      onApplicantUpdated(applicant.applicationId, status);
      toast.success(status === "Accepted" ? t("applicants.accepted") : t("applicants.rejected"));
    } catch {
      toast.error(t("applicants.updateError"));
    } finally {
      setActiveAction(null);
    }
  };

  const formatAppliedLabel = (value: string) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    const isToday = parsedDate.toDateString() === new Date().toDateString();
    if (isToday) {
      const time = parsedDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
      return t("home.dashboard.appliedToday", { time });
    }

    return `${formatDisplayDate(value)} ${parsedDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const showDesktopNext =
    !isMobile && canGoNext && applicants.length > DESKTOP_SLIDES_PER_VIEW;

  if (isLoading) {
    return <div className={styles.skeleton} aria-hidden />;
  }

  if (applicants.length === 0) {
    return <p className={styles.emptyText}>{t("home.noApplicantsWaiting")}</p>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.carouselViewport} ${isMobile ? styles.carouselViewportMobile : ""}`}>
        <div
          key={isMobile ? "mobile" : "desktop"}
          ref={sliderRef}
          className={`keen-slider ${styles.carousel}`}
        >
          {applicants.map((applicant) => (
            <article
              key={applicant.applicationId}
              className={`keen-slider__slide ${styles.slide} ${isMobile ? styles.slideMobile : ""}`}
            >
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <Link
                    to={`/employees/${applicant.userId}`}
                    className={styles.avatarLink}
                    aria-label={`${applicant.firstName} ${applicant.lastName}`}
                  >
                    <ChatContactAvatar
                      name={`${applicant.firstName} ${applicant.lastName}`}
                      profilePhoto={applicant.profilePhoto}
                      size="md"
                    />
                  </Link>

                  <div className={styles.headerText}>
                    <Link to={`/employees/${applicant.userId}`} className={styles.nameLink}>
                      {applicant.firstName} {applicant.lastName}
                    </Link>
                    <p className={styles.jobTitle}>
                      {t("home.dashboard.appliedForJob", {
                        title: applicant.jobPostTitle,
                        location: applicant.jobPostLocation,
                      })}
                    </p>
                    <p className={styles.appliedAt}>
                      {t("applicants.appliedAt")}: {formatAppliedLabel(applicant.appliedAt)}
                    </p>
                  </div>

                  {applicant.reviewCount > 0 ? (
                    <span className={styles.ratingPill}>★ {applicant.averageRating.toFixed(1)}</span>
                  ) : (
                    <span className={styles.ratingPlaceholder} aria-hidden />
                  )}
                </div>

                <div className={styles.actions}>
                  <Link to={`/employees/${applicant.userId}`} className={styles.viewProfileButton}>
                    {t("jobPosts.viewProfile")}
                  </Link>
                  <button
                    type="button"
                    className={styles.acceptButton}
                    disabled={activeAction !== null}
                    onClick={() => void handleDecision(applicant, "Accepted")}
                  >
                    {activeAction === `${applicant.applicationId}:Accepted`
                      ? t("applicants.accepting")
                      : t("applicants.accept")}
                  </button>
                  <button
                    type="button"
                    className={styles.rejectButton}
                    disabled={activeAction !== null}
                    aria-label={t("applicants.reject")}
                    onClick={() => void handleDecision(applicant, "Denied")}
                  >
                    {activeAction === `${applicant.applicationId}:Denied` ? (
                      "..."
                    ) : (
                      <XMarkIcon className={styles.rejectIcon} aria-hidden />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {showDesktopNext ? (
          <button
            type="button"
            className={styles.nextButton}
            aria-label={t("profile.nextPage")}
            onClick={() => instanceRef.current?.next()}
          >
            <ChevronRightIcon className={styles.nextIcon} aria-hidden />
          </button>
        ) : null}
      </div>

      {isMobile && applicants.length > 1 ? (
        <div className={styles.dots} role="tablist" aria-label={t("home.applicantsWaiting")}>
          {applicants.map((applicant, index) => (
            <button
              key={applicant.applicationId}
              type="button"
              role="tab"
              aria-selected={index === currentSlide}
              className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ""}`}
              onClick={() => instanceRef.current?.moveToIdx(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default EmployerDashboardPendingCarousel;
