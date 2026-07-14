import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mui/material";
import { toast } from "react-toastify";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../store/Auth-context";
import { Employee } from "../../models/User.model";
import { JobPost } from "../../models/JobPost.model";
import { EmployeeApplication } from "../../models/Application.model";
import { ReviewSummary } from "../../models/Review.model";
import { GetCandidateRecommendedJobs } from "../../services/jobPost-service";
import { GetEmployersWithFavouriteStatus } from "../../services/user-service";
import { GetMyApplications } from "../../services/application-service";
import { GetChatConversationByApplication } from "../../services/chat-service";
import { GetEmployeeReviewSummary } from "../../services/review-service";
import RecommendedJobPostCard from "../../components/EmployeeDashboard/RecommendedJobPostCard";
import RestaurantLogoCarousel from "../../components/EmployeeDashboard/RestaurantLogoCarousel";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import styles from "./EmployeeDashboard.module.scss";

const SHIFT_CAROUSEL_PAGE_SIZE_DESKTOP = 3;
const SHIFT_CAROUSEL_PAGE_SIZE_MOBILE = 1;

const isShiftOver = (startingDate: string) => {
  const parsedDate = new Date(startingDate);
  return Number.isFinite(parsedDate.getTime()) && parsedDate < new Date();
};

const formatShiftDateTime = (startingDate: string) => {
  const parsedDate = new Date(startingDate);
  if (!Number.isFinite(parsedDate.getTime())) {
    return formatDisplayDate(startingDate);
  }

  const time = parsedDate.toLocaleTimeString("sr-RS", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatDisplayDate(startingDate)} ${time}`;
};

const EmployeeDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { me } = useContext(AuthContext);
  const employee = me && "firstName" in me ? (me as Employee) : null;

  const [recommendedPosts, setRecommendedPosts] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<EmployeeApplication[]>([]);
  const [appliedJobPostIds, setAppliedJobPostIds] = useState<string[]>([]);
  const [browseRestaurants, setBrowseRestaurants] = useState<
    { id: string; name: string; profilePhoto?: string; publicSlug?: string; isFavourite: boolean }[]
  >([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({ averageRating: 0, reviewCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [shiftPage, setShiftPage] = useState(0);
  const [openingChatFor, setOpeningChatFor] = useState<string | null>(null);

  const acceptedShifts = useMemo(
    () =>
      applications
        .filter((application) => application.status === "Accepted")
        .sort(
          (left, right) =>
            new Date(right.startingDate).getTime() - new Date(left.startingDate).getTime()
        ),
    [applications]
  );
  const appliedJobPostIdSet = useMemo(() => new Set(appliedJobPostIds), [appliedJobPostIds]);
  const nextShift = useMemo(
    () =>
      acceptedShifts
        .filter((shift) => !isShiftOver(shift.startingDate))
        .sort(
          (left, right) =>
            new Date(left.startingDate).getTime() - new Date(right.startingDate).getTime()
        )[0],
    [acceptedShifts]
  );
  const totalEarnings = useMemo(
    () =>
      acceptedShifts
        .filter((shift) => isShiftOver(shift.startingDate))
        .reduce((total, shift) => total + shift.salary, 0),
    [acceptedShifts]
  );
  const shiftCardsPerPage = isMobile ? SHIFT_CAROUSEL_PAGE_SIZE_MOBILE : SHIFT_CAROUSEL_PAGE_SIZE_DESKTOP;
  const shiftPageCount = Math.max(1, Math.ceil(acceptedShifts.length / shiftCardsPerPage));
  const visibleShifts = acceptedShifts.slice(
    shiftPage * shiftCardsPerPage,
    shiftPage * shiftCardsPerPage + shiftCardsPerPage
  );

  const goToShiftPage = (nextPage: number) => {
    setShiftPage((nextPage + shiftPageCount) % shiftPageCount);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      if (!employee) {
        setIsLoading(false);
        return;
      }

      try {
        const [postsResponse, restaurantsResponse, applicationsResponse, reviewSummaryResponse] = await Promise.all([
          GetCandidateRecommendedJobs(3),
          GetEmployersWithFavouriteStatus(),
          GetMyApplications(),
          GetEmployeeReviewSummary(employee.id),
        ]);

        setRecommendedPosts(postsResponse.data);
        setApplications(applicationsResponse.data);
        setAppliedJobPostIds(
          applicationsResponse.data.map((application) => application.jobPostId).filter(Boolean)
        );
        setReviewSummary(reviewSummaryResponse.data);
        setBrowseRestaurants(
          restaurantsResponse.data.map((restaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            profilePhoto: restaurant.profilePhoto,
            publicSlug: restaurant.publicSlug,
            isFavourite: restaurant.isFavourite,
          }))
        );
      } catch (error) {
        console.error("Failed to load employee dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [employee]);

  useEffect(() => {
    setShiftPage((currentPage) => Math.min(currentPage, shiftPageCount - 1));
  }, [shiftPageCount]);

  const handleFavouriteChange = (restaurantId: string, isFavourite: boolean) => {
    setBrowseRestaurants((previous) =>
      previous.map((restaurant) =>
        restaurant.id === restaurantId ? { ...restaurant, isFavourite } : restaurant
      )
    );
  };

  const handleApplied = (jobPostId: string) => {
    setAppliedJobPostIds((previousIds) =>
      previousIds.includes(jobPostId) ? previousIds : [...previousIds, jobPostId]
    );
  };

  const openShiftChat = async (applicationId: string) => {
    setOpeningChatFor(applicationId);
    try {
      const response = await GetChatConversationByApplication(applicationId);
      navigate(`/messages/${response.data.conversationId}`);
    } catch {
      toast.error(t("candidateShifts.chatUnavailable"));
    } finally {
      setOpeningChatFor(null);
    }
  };

  if (!employee) {
    return null;
  }

  const nextShiftLocation = nextShift?.restaurantLocationName
    ? `${nextShift.restaurantLocationName}${
        nextShift.restaurantLocationCity ? ` (${nextShift.restaurantLocationCity})` : ""
      }`
    : t("common.notAvailable");

  return (
    <div className={styles.dashboard}>
      <section className={styles.statsGrid} aria-label={t("candidateDashboard.statsAriaLabel")}>
        <article className={styles.statCard}>
          <span className={styles.statEmoji} aria-hidden>📄</span>
          <div>
            <p className={styles.statLabel}>{t("candidateDashboard.applications")}</p>
            <p className={styles.statValue}>{appliedJobPostIds.length}</p>
          </div>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statEmoji} aria-hidden>✅</span>
          <div>
            <p className={styles.statLabel}>{t("candidateDashboard.acceptedShifts")}</p>
            <p className={styles.statValue}>{acceptedShifts.length}</p>
          </div>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statEmoji} aria-hidden>⭐</span>
          <div>
            <p className={styles.statLabel}>{t("candidateDashboard.averageRating")}</p>
            <p className={styles.statValue}>
              {reviewSummary.reviewCount > 0 ? reviewSummary.averageRating.toFixed(1) : "—"}
            </p>
          </div>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statEmoji} aria-hidden>💰</span>
          <div>
            <p className={styles.statLabel}>{t("candidateDashboard.totalEarnings")}</p>
            <p className={styles.statValue}>{totalEarnings.toLocaleString("sr-RS")} RSD</p>
          </div>
        </article>
      </section>

      <section className={styles.nextShiftSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("candidateDashboard.nextShiftTitle")}</h2>
        </div>

        {isLoading ? (
          <div className={styles.nextShiftSkeleton} />
        ) : nextShift ? (
          <article className={styles.nextShiftCard}>
            <div className={styles.nextShiftMain}>
              <div>
                <h3>{nextShift.jobPostTitle}</h3>
                <p className={styles.nextShiftRestaurant}>{nextShift.employerName}</p>
              </div>
              <span className={`${styles.shiftStatus} ${styles.shiftStatusUpcoming}`}>
                {t("candidateShifts.upcoming")}
              </span>
            </div>

            <div className={styles.nextShiftMetaGrid}>
              <span>
                <MapPinIcon aria-hidden />
                {nextShiftLocation}
              </span>
              <span>
                <CalendarDaysIcon aria-hidden />
                {formatShiftDateTime(nextShift.startingDate)}
              </span>
              <span>
                <BanknotesIcon aria-hidden />
                {nextShift.salary} RSD
              </span>
            </div>

            <button
              type="button"
              className={styles.nextShiftChatButton}
              onClick={() => void openShiftChat(nextShift.applicationId)}
              disabled={openingChatFor === nextShift.applicationId}
            >
              <ChatBubbleLeftRightIcon aria-hidden />
              {openingChatFor === nextShift.applicationId
                ? t("common.loading")
                : t("candidateDashboard.openChat")}
            </button>
          </article>
        ) : (
          <p className={styles.emptyText}>{t("candidateDashboard.noUpcomingShift")}</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("candidate.recommendedPosts")}</h2>
          <Link to="/oglasi-za-posao" className={styles.sectionLink}>
            {t("candidate.viewAll")}
          </Link>
        </div>

        <div className={styles.recommendedGrid}>
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <article key={index} className={`${styles.cardSkeleton}`} />
              ))
            : recommendedPosts.length > 0
              ? recommendedPosts.map((post) => (
                  <RecommendedJobPostCard
                    key={post.id}
                    jobPost={post}
                    hasApplied={appliedJobPostIdSet.has(post.id)}
                    onApplied={handleApplied}
                  />
                ))
              : (
                <p className={styles.emptyText}>{t("candidateDashboard.noRecommendedJobs")}</p>
              )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>{t("home.shiftPreviewTitle")}</h2>
            <p className={styles.sectionSubtitle}>{t("home.shiftPreviewSubtitle")}</p>
          </div>
          <Link to="/moje-smene" className={styles.sectionLink}>
            {t("home.shiftPreviewCta")}
          </Link>
        </div>

        {isLoading ? (
          <div className={styles.carouselSkeleton} />
        ) : acceptedShifts.length > 0 ? (
          <>
            <div className={styles.shiftsCarousel}>
              <button
                type="button"
                className={styles.carouselArrow}
                onClick={() => goToShiftPage(shiftPage - 1)}
                aria-label={t("common.previous")}
              >
                <ChevronLeftIcon aria-hidden />
              </button>

              <div className={styles.shiftCardsGrid}>
                {visibleShifts.map((shift) => {
                  const isPast = isShiftOver(shift.startingDate);
                  return (
                    <article key={shift.applicationId} className={styles.shiftCard}>
                      <div className={styles.shiftCardTop}>
                        <div>
                          <h3>{shift.jobPostTitle}</h3>
                          <p>{shift.employerName}</p>
                        </div>
                        <span className={`${styles.shiftStatus} ${isPast ? styles.shiftStatusCompleted : styles.shiftStatusUpcoming}`}>
                          {isPast ? t("candidateShifts.archived") : t("candidateShifts.upcoming")}
                        </span>
                      </div>
                      <div className={styles.shiftMeta}>
                        <span>
                          <CalendarDaysIcon aria-hidden />
                          {formatDisplayDate(shift.startingDate)}
                        </span>
                        <span>
                          <BanknotesIcon aria-hidden />
                          {shift.salary} RSD
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <button
                type="button"
                className={styles.carouselArrow}
                onClick={() => goToShiftPage(shiftPage + 1)}
                aria-label={t("common.next")}
              >
                <ChevronRightIcon aria-hidden />
              </button>
            </div>

            <div className={styles.carouselDots} aria-hidden="true">
              {Array.from({ length: shiftPageCount }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === shiftPage ? styles.carouselDotActive : styles.carouselDot}
                  onClick={() => setShiftPage(index)}
                />
              ))}
            </div>
          </>
        ) : (
          <p className={styles.emptyText}>{t("candidateShifts.empty")}</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("header.restaurants")}</h2>
          <Link to="/restaurants" className={styles.sectionLink}>
            {t("candidate.exploreRestaurants")}
          </Link>
        </div>

        {isLoading ? (
          <div className={styles.carouselSkeleton} />
        ) : browseRestaurants.length > 0 ? (
          <RestaurantLogoCarousel
            restaurants={browseRestaurants}
            onFavouriteChange={handleFavouriteChange}
          />
        ) : (
          <p className={styles.emptyText}>{t("employers.noEmployers")}</p>
        )}
      </section>
    </div>
  );
};



export default EmployeeDashboard;


