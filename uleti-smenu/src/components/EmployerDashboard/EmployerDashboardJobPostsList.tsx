import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mui/material";
import { EllipsisVerticalIcon, MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { JobPost } from "../../models/JobPost.model";
import {
  EmployerDashboardJobTab,
  countEmployerDashboardJobPostsByTab,
  filterEmployerDashboardJobPosts,
  getEmployerDashboardJobStatusBadge,
} from "../../helpers/employerDashboardJobPosts";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import styles from "./EmployerDashboardJobPostsList.module.scss";

const LIST_LIMIT = 5;

type EmployerDashboardJobPostsListProps = {
  jobPosts: JobPost[];
  isLoading: boolean;
};

const EmployerDashboardJobPostsList = ({ jobPosts, isLoading }: EmployerDashboardJobPostsListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:1023px)");
  const [activeTab, setActiveTab] = useState<EmployerDashboardJobTab>("active");
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const tabCounts = useMemo(() => countEmployerDashboardJobPostsByTab(jobPosts), [jobPosts]);

  const filteredPosts = useMemo(
    () => filterEmployerDashboardJobPosts(jobPosts, activeTab).slice(0, LIST_LIMIT),
    [jobPosts, activeTab]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenuPostId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatLocation = (post: JobPost) => {
    if (!post.restaurantLocationName) {
      return post.restaurantLocationCity || "-";
    }

    return post.restaurantLocationCity
      ? `${post.restaurantLocationName} (${post.restaurantLocationCity})`
      : post.restaurantLocationName;
  };

  const handleOpenPost = (post: JobPost) => {
    setOpenMenuPostId(null);
    if (isMobile) {
      navigate(`/oglasi-za-posao/${post.id}`);
      return;
    }

    navigate("/oglasi-za-posao");
  };

  const tabs: { id: EmployerDashboardJobTab; label: string; count: number }[] = [
    { id: "active", label: t("home.dashboard.tabActive"), count: tabCounts.active },
    { id: "draft", label: t("home.dashboard.tabPending"), count: tabCounts.draft },
    { id: "inactive", label: t("home.dashboard.tabInactive"), count: tabCounts.inactive },
  ];

  if (isLoading) {
    return <div className={styles.skeleton} aria-hidden />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} role="tablist" aria-label={t("home.myJobPosts")}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className={styles.tabCount}>{tab.count}</span>
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <p className={styles.emptyText}>{t("home.noJobPosts")}</p>
      ) : (
        <div className={styles.list}>
          {filteredPosts.map((post) => {
            const statusBadge = getEmployerDashboardJobStatusBadge(post, t);
            const applicantCount = post.applicantCount ?? 0;
            const shiftDate = formatDisplayDate(String(post.startingDate));

            return (
              <article key={post.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.titleRow}>
                    <h3 className={styles.title}>{post.title}</h3>
                    <span
                      className={`${styles.statusBadge} ${styles[`statusBadge${statusBadge.variant}`]}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {!isMobile ? (
                    <div className={styles.desktopMeta}>
                      <span className={styles.location}>
                        <MapPinIcon className={styles.locationIcon} aria-hidden />
                        {formatLocation(post)}
                      </span>
                      <span className={styles.applications}>
                        {t("jobPosts.applicationsCount", { count: applicantCount })}
                      </span>
                      <span className={styles.date}>
                        <CalendarDaysIcon className={styles.dateIcon} aria-hidden />
                        {t("jobPosts.shiftOn", { date: shiftDate })}
                      </span>
                    </div>
                  ) : (
                    <p className={styles.mobileMeta}>
                      {t("home.dashboard.mobilePostMeta", {
                        count: applicantCount,
                        date: shiftDate,
                      })}
                    </p>
                  )}
                </div>

                <div className={styles.menuWrap} ref={openMenuPostId === post.id ? menuRef : null}>
                  <button
                    type="button"
                    className={styles.menuButton}
                    aria-label={t("header.menu")}
                    aria-expanded={openMenuPostId === post.id}
                    onClick={() =>
                      setOpenMenuPostId((current) => (current === post.id ? null : post.id))
                    }
                  >
                    <EllipsisVerticalIcon className={styles.menuIcon} aria-hidden />
                  </button>

                  {openMenuPostId === post.id ? (
                    <div className={styles.menu}>
                      <button type="button" className={styles.menuItem} onClick={() => handleOpenPost(post)}>
                        {t("home.dashboard.managePost")}
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className={styles.footerLinkWrap}>
        <Link className={styles.footerLink} to="/oglasi-za-posao">
          {t("home.viewAllPosts")} →
        </Link>
      </div>
    </div>
  );
};

export default EmployerDashboardJobPostsList;
