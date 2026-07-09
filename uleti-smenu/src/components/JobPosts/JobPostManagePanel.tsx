import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  ArchiveBoxArrowDownIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  MapPinIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ArchiveMyJobPost,
  DeleteMyJobPost,
  DuplicateMyJobPost,
  GetMyJobPostApplicationStats,
  UpdateMyJobPost,
} from "../../services/jobPost-service";
import { JobPost } from "../../models/JobPost.model";
import { JobPostApplicationStats } from "../../models/JobPostApplicationStats.model";
import { getApiErrorMessage } from "../../helpers/apiError";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { getEmployerDashboardJobStatusBadge } from "../../helpers/employerDashboardJobPosts";
import ConfirmActionDialog from "../Dialog/ConfirmActionDialog";
import styles from "./JobPostManagePanel.module.scss";

export type JobPostManagePanelActions = {
  onEdit: (jobPost: JobPost) => void;
  onViewCandidates: (jobPost: JobPost) => void;
  onPreview: (jobPost: JobPost) => void;
  onPostsChanged: () => void;
};

type JobPostManagePanelProps = {
  jobPost: JobPost | null;
  isOpen: boolean;
  onClose: () => void;
} & JobPostManagePanelActions;

const emptyStats: JobPostApplicationStats = {
  totalApplications: 0,
  accepted: 0,
  pending: 0,
  denied: 0,
};

const JobPostManagePanel = ({
  jobPost,
  isOpen,
  onClose,
  onEdit,
  onViewCandidates,
  onPreview,
  onPostsChanged,
}: JobPostManagePanelProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:1023px)");
  const [stats, setStats] = useState<JobPostApplicationStats>(emptyStats);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const statusBadge = useMemo(
    () => (jobPost ? getEmployerDashboardJobStatusBadge(jobPost, t) : null),
    [jobPost, t]
  );

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      return;
    }

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !jobPost) {
      return;
    }

    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const response = await GetMyJobPostApplicationStats(jobPost.id);
        setStats(response.data);
      } catch {
        setStats(emptyStats);
      } finally {
        setStatsLoading(false);
      }
    };

    void loadStats();
  }, [isOpen, jobPost]);

  if (!isOpen || !jobPost) {
    return null;
  }

  const locationLabel = jobPost.restaurantLocationName
    ? jobPost.restaurantLocationCity
      ? `${jobPost.restaurantLocationName} (${jobPost.restaurantLocationCity})`
      : jobPost.restaurantLocationName
    : jobPost.restaurantLocationCity || "-";

  const shiftDate = formatDisplayDate(String(jobPost.startingDate));
  const canDelete = (jobPost.applicantCount ?? stats.totalApplications) === 0;

  const runAction = async (actionId: string, action: () => Promise<void>) => {
    setPendingAction(actionId);
    try {
      await action();
    } finally {
      setPendingAction(null);
    }
  };

  const handleDuplicate = () =>
    runAction("duplicate", async () => {
      try {
        await DuplicateMyJobPost(jobPost.id);
        toast.success(t("jobPostManage.duplicateSuccess"));
        onPostsChanged();
        onClose();
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, t("jobPostManage.duplicateError")));
      }
    });

  const handleArchive = () =>
    runAction("archive", async () => {
      try {
        await ArchiveMyJobPost(jobPost.id);
        toast.success(t("jobPostManage.archiveSuccess"));
        onPostsChanged();
        onClose();
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, t("jobPostManage.archiveError")));
      }
    });

  const handleActivate = () =>
    runAction("activate", async () => {
      try {
        await UpdateMyJobPost(jobPost.id, {
          title: jobPost.title,
          description: jobPost.description,
          position: jobPost.position,
          status: "Active",
          salary: jobPost.salary,
          startingDate: new Date(jobPost.startingDate),
          visibleUntil: jobPost.visibleUntil ? new Date(jobPost.visibleUntil) : undefined,
          restaurantLocationId: jobPost.restaurantLocationId ?? "",
        });
        toast.success(t("jobPostManage.activateSuccess"));
        onPostsChanged();
        onClose();
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, t("jobPostManage.activateError")));
        onClose();
        onEdit(jobPost);
      }
    });

  const handleDelete = () =>
    runAction("delete", async () => {
      setIsDeleting(true);
      try {
        await DeleteMyJobPost(jobPost.id);
        toast.success(t("jobPostManage.deleteSuccess"));
        onPostsChanged();
        onClose();
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, t("jobPostManage.deleteError")));
      } finally {
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    });

  const overviewItems = [
    { label: t("jobPostManage.statsApplications"), value: stats.totalApplications },
    { label: t("jobPostManage.statsAccepted"), value: stats.accepted },
    { label: t("jobPostManage.statsPending"), value: stats.pending },
    { label: t("jobPostManage.statsDenied"), value: stats.denied },
  ];

  const actions = [
    {
      id: "activate",
      label: t("jobPostManage.actionActivate"),
      description: t("jobPostManage.actionActivateDesc"),
      icon: CheckCircleIcon,
      tone: "default" as const,
      onClick: () => void handleActivate(),
      hidden: jobPost.status !== "Draft",
    },
    {
      id: "edit",
      label: t("jobPostManage.actionEdit"),
      description: t("jobPostManage.actionEditDesc"),
      icon: PencilSquareIcon,
      tone: "default" as const,
      onClick: () => {
        onClose();
        onEdit(jobPost);
      },
    },
    {
      id: "candidates",
      label: t("jobPostManage.actionCandidates"),
      description: t("jobPostManage.actionCandidatesDesc"),
      icon: UserGroupIcon,
      tone: "default" as const,
      onClick: () => {
        onClose();
        onViewCandidates(jobPost);
      },
    },
    {
      id: "preview",
      label: t("jobPostManage.actionPreview"),
      description: t("jobPostManage.actionPreviewDesc"),
      icon: EyeIcon,
      tone: "default" as const,
      onClick: () => {
        onClose();
        onPreview(jobPost);
      },
    },
    {
      id: "duplicate",
      label: t("jobPostManage.actionDuplicate"),
      description: t("jobPostManage.actionDuplicateDesc"),
      icon: DocumentDuplicateIcon,
      tone: "default" as const,
      onClick: () => void handleDuplicate(),
    },
    {
      id: "archive",
      label: t("jobPostManage.actionArchive"),
      description: t("jobPostManage.actionArchiveDesc"),
      icon: ArchiveBoxArrowDownIcon,
      tone: "warning" as const,
      onClick: () => void handleArchive(),
      hidden: jobPost.status === "Cancelled",
    },
    {
      id: "delete",
      label: t("jobPostManage.actionDelete"),
      description: t("jobPostManage.actionDeleteDesc"),
      icon: TrashIcon,
      tone: "danger" as const,
      onClick: () => setShowDeleteConfirm(true),
      disabled: !canDelete,
      descriptionOverride: !canDelete ? t("jobPostManage.actionDeleteDisabledDesc") : undefined,
    },
  ].filter((action) => !action.hidden);

  return (
    <div className={styles.root}>
      <button type="button" className={styles.backdrop} aria-label={t("common.close")} onClick={onClose} />

      <aside
        className={`${styles.panel} ${isMobile ? styles.panelMobile : styles.panelDesktop}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("jobPostManage.title")}
      >
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h2>{t("jobPostManage.title")}</h2>
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label={t("common.close")}>
              <XMarkIcon />
            </button>
          </div>

          <div className={styles.postSummary}>
            <div className={styles.postTitleRow}>
              <h3>{jobPost.title}</h3>
              {statusBadge ? (
                <span className={`${styles.statusBadge} ${styles[`statusBadge${statusBadge.variant}`]}`}>
                  {statusBadge.label}
                </span>
              ) : null}
            </div>
            <p className={styles.metaLine}>
              <MapPinIcon aria-hidden />
              <span>{locationLabel}</span>
            </p>
            <p className={styles.metaLine}>
              <CalendarDaysIcon aria-hidden />
              <span>{t("jobPosts.shiftOn", { date: shiftDate })}</span>
            </p>
          </div>
        </header>

        <div className={styles.body}>
          <section className={styles.section}>
            <h4>{t("jobPostManage.overviewTitle")}</h4>
            {statsLoading ? (
              <p className={styles.muted}>{t("common.loading")}</p>
            ) : (
              <ul className={styles.statsList}>
                {overviewItems.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section}>
            <h4>{t("jobPostManage.actionsTitle")}</h4>
            <div className={styles.actionsList}>
              {actions.map((action) => {
                const Icon = action.icon;
                const isPending = pendingAction === action.id;

                return (
                  <button
                    key={action.id}
                    type="button"
                    className={`${styles.actionButton} ${styles[`actionButton${action.tone}`]}`}
                    onClick={action.onClick}
                    disabled={isPending || isDeleting || action.disabled}
                  >
                    <span className={styles.actionIconWrap}>
                      <Icon aria-hidden />
                    </span>
                    <span className={styles.actionText}>
                      <strong>{isPending ? t("common.loading") : action.label}</strong>
                      <span>{action.descriptionOverride ?? action.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

      </aside>

      {showDeleteConfirm ? (
        <ConfirmActionDialog
          title={t("jobPostManage.deleteConfirmTitle")}
          message={t("jobPostManage.deleteConfirmMessage")}
          confirmLabel={t("jobPostManage.actionDelete")}
          isLoading={isDeleting}
          onConfirm={() => void handleDelete()}
          onClose={() => {
            if (!isDeleting) {
              setShowDeleteConfirm(false);
            }
          }}
        />
      ) : null}
    </div>
  );
};

export default JobPostManagePanel;
