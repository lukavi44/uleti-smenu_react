import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import JobPostsSideDrawer from "../../components/JobPosts/JobPostsSideDrawer";
import { EmployeeApplication } from "../../models/Application.model";
import { GetMyApplications } from "../../services/application-service";
import { GetChatConversationByApplication } from "../../services/chat-service";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { AuthContext } from "../../store/Auth-context";
import styles from "./CandidateShiftsPage.module.scss";

type ShiftStatusFilter = "all" | "upcoming" | "completed";
type ShiftSort = "newest" | "oldest" | "salaryDesc";

const PAGE_SIZE = 5;

const isShiftOver = (startingDate: string) => {
  const parsedDate = new Date(startingDate);
  return Number.isFinite(parsedDate.getTime()) && parsedDate < new Date();
};

const CandidateShiftsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const [applications, setApplications] = useState<EmployeeApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openingChatFor, setOpeningChatFor] = useState<string | null>(null);
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ShiftStatusFilter>("all");
  const [sortValue, setSortValue] = useState<ShiftSort>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      if (role !== "Employee") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await GetMyApplications();
        setApplications(response.data);
      } catch {
        toast.error(t("candidateShifts.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, [role, t]);

  const restaurantOptions = useMemo(
    () =>
      [...new Set(applications
        .filter((application) => application.status === "Accepted")
        .map((application) => application.employerName)
        .filter(Boolean))]
        .sort((left, right) => left.localeCompare(right)),
    [applications]
  );

  const filteredShifts = useMemo(() => {
    const shifts = applications.filter((application) => {
      if (application.status !== "Accepted") return false;
      if (restaurantFilter !== "all" && application.employerName !== restaurantFilter) return false;

      const completed = isShiftOver(application.startingDate);
      if (statusFilter === "completed") return completed;
      if (statusFilter === "upcoming") return !completed;

      return true;
    });

    return [...shifts].sort((left, right) => {
      if (sortValue === "oldest") {
        return new Date(left.startingDate).getTime() - new Date(right.startingDate).getTime();
      }
      if (sortValue === "salaryDesc") {
        return right.salary - left.salary;
      }

      return new Date(right.startingDate).getTime() - new Date(left.startingDate).getTime();
    });
  }, [applications, restaurantFilter, sortValue, statusFilter]);

  const visibleShifts = filteredShifts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredShifts.length;
  const activeFilterCount = [
    restaurantFilter !== "all",
    statusFilter !== "all",
    sortValue !== "newest",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setRestaurantFilter("all");
    setStatusFilter("all");
    setSortValue("newest");
    setVisibleCount(PAGE_SIZE);
  };

  const openChat = async (applicationId: string) => {
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

  if (role !== "Employee") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  return (
    <section className={styles.page}>
      <JobPostsSideDrawer
        isOpen={isFiltersOpen}
        title={t("candidateShifts.filters")}
        subtitle={t("candidateShifts.filtersSubtitle")}
        onClose={() => setIsFiltersOpen(false)}
        footer={
          <>
            <button type="button" className={styles.drawerResetButton} onClick={resetFilters}>
              {t("candidateShifts.resetFilters")}
            </button>
            <button type="button" className={styles.drawerApplyButton} onClick={() => setIsFiltersOpen(false)}>
              {t("candidateShifts.showResults", { count: filteredShifts.length })}
            </button>
          </>
        }
      >
        <div className={styles.drawerFilters}>
          <label className={styles.filterField}>
            <span>{t("candidateShifts.restaurantFilter")}</span>
            <select
              className={styles.filterSelect}
              value={restaurantFilter}
              onChange={(event) => {
                setRestaurantFilter(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="all">{t("candidateShifts.allRestaurants")}</option>
              {restaurantOptions.map((restaurant) => (
                <option key={restaurant} value={restaurant}>
                  {restaurant}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>{t("candidateShifts.statusFilter")}</span>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ShiftStatusFilter);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="all">{t("candidateShifts.allStatuses")}</option>
              <option value="upcoming">{t("candidateShifts.upcoming")}</option>
              <option value="completed">{t("candidateShifts.archived")}</option>
            </select>
          </label>

          <label className={styles.filterField}>
            <span>{t("candidateShifts.sortLabel")}</span>
            <select
              className={styles.filterSelect}
              value={sortValue}
              onChange={(event) => {
                setSortValue(event.target.value as ShiftSort);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="newest">{t("candidateShifts.sortNewest")}</option>
              <option value="oldest">{t("candidateShifts.sortOldest")}</option>
              <option value="salaryDesc">{t("candidateShifts.sortSalaryDesc")}</option>
            </select>
          </label>
        </div>
      </JobPostsSideDrawer>

      <header className={styles.header}>
        <h1>{t("candidateShifts.title")}</h1>
        <p>{t("candidateShifts.subtitle")}</p>
      </header>

      <div className={styles.filterRow}>
        <button type="button" className={styles.filterButton} onClick={() => setIsFiltersOpen(true)}>
          <FunnelIcon className={styles.filterIcon} aria-hidden />
          <span>{t("candidateShifts.filters")}</span>
          {activeFilterCount > 0 ? <span className={styles.filterBadge}>{activeFilterCount}</span> : null}
        </button>
      </div>

      {isLoading ? <p className={styles.muted}>{t("common.loading")}</p> : null}

      {!isLoading && filteredShifts.length === 0 ? (
        <p className={styles.empty}>{t("candidateShifts.empty")}</p>
      ) : null}

      <div className={styles.list}>
        {visibleShifts.map((shift) => {
          const isPast = isShiftOver(shift.startingDate);
          const location = shift.restaurantLocationName
            ? `${shift.restaurantLocationName}${
                shift.restaurantLocationCity ? ` (${shift.restaurantLocationCity})` : ""
              }`
            : "-";

          return (
            <article key={shift.applicationId} className={`${styles.card} ${isPast ? styles.cardPast : ""}`}>
              <div className={styles.cardMain}>
                <div>
                  <h2>{shift.jobPostTitle}</h2>
                  <p className={styles.restaurant}>{shift.employerName}</p>
                </div>
                <span className={`${styles.status} ${isPast ? styles.statusPast : ""}`}>
                  {isPast ? t("candidateShifts.archived") : t("candidateShifts.upcoming")}
                </span>
                <ChevronRightIcon className={styles.mobileChevron} aria-hidden />
              </div>

              <dl className={styles.metaGrid}>
                <div>
                  <dt>{t("jobPosts.location")}</dt>
                  <dd>{location}</dd>
                </div>
                <div>
                  <dt>{t("jobPosts.startingDate")}</dt>
                  <dd>{formatDisplayDate(shift.startingDate)}</dd>
                </div>
                <div>
                  <dt>{t("jobPosts.salary")}</dt>
                  <dd>{shift.salary} RSD</dd>
                </div>
                <div>
                  <dt>{t("jobPosts.position")}</dt>
                  <dd>{shift.position}</dd>
                </div>
              </dl>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.chatButton}
                  onClick={() => void openChat(shift.applicationId)}
                  disabled={isPast || openingChatFor === shift.applicationId}
                >
                  <ChatBubbleLeftRightIcon aria-hidden />
                  {isPast
                    ? t("candidateShifts.chatClosed")
                    : openingChatFor === shift.applicationId
                      ? t("common.loading")
                      : t("candidateShifts.openChat")}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {hasMore ? (
        <button
          type="button"
          className={styles.loadMoreButton}
          onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
        >
          {t("candidateShifts.loadMore")}
        </button>
      ) : null}
    </section>
  );
};

export default CandidateShiftsPage;
