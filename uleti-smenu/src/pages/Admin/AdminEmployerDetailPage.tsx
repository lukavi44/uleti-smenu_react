import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AdminEmployerDetail } from "../../models/Admin.model";
import {
  getAdminEmployerDetail,
  setAdminEmployerNotes,
  setAdminEmployerSuspension,
  setAdminEmployerVerification,
} from "../../services/admin-service";
import AdminStatusBadge from "../../components/Admin/AdminStatusBadge";
import AdminVerificationModal from "../../components/Admin/AdminVerificationModal";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { formatDisplayDateTime } from "../../helpers/formatDisplayDateTime";
import styles from "./AdminEmployerDetailPage.module.scss";

type DetailTab = "overview" | "jobPosts" | "branches" | "statistics" | "billing" | "notes";

const AdminEmployerDetailPage = () => {
  const { t } = useTranslation();
  const { employerId = "" } = useParams();
  const [employer, setEmployer] = useState<AdminEmployerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"confirm" | "success">("confirm");
  const [pendingVerified, setPendingVerified] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingSuspension, setSavingSuspension] = useState(false);

  useEffect(() => {
    const loadEmployer = async () => {
      setLoading(true);
      try {
        const response = await getAdminEmployerDetail(employerId);
        setEmployer(response.data);
        setNotesDraft(response.data.adminNotes ?? "");
      } catch {
        setEmployer(null);
      } finally {
        setLoading(false);
      }
    };

    if (employerId) {
      void loadEmployer();
    }
  }, [employerId]);

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "overview", label: t("admin.employerDetail.tabs.overview") },
    { id: "jobPosts", label: t("admin.employerDetail.tabs.jobPosts") },
    { id: "branches", label: t("admin.employerDetail.tabs.branches") },
    { id: "statistics", label: t("admin.employerDetail.tabs.statistics") },
    { id: "billing", label: t("admin.employerDetail.tabs.billing") },
    { id: "notes", label: t("admin.employerDetail.tabs.notes") },
  ];

  const openVerificationModal = (nextVerified: boolean) => {
    setPendingVerified(nextVerified);
    setModalMode("confirm");
    setModalOpen(true);
  };

  const handleConfirmVerification = async () => {
    if (!employer) {
      return;
    }

    setSaving(true);
    try {
      const response = await setAdminEmployerVerification(employer.id, pendingVerified);
      setEmployer(response.data);
      setNotesDraft(response.data.adminNotes ?? "");
      if (pendingVerified) {
        setModalMode("success");
      } else {
        setModalOpen(false);
      }
    } catch {
      setModalOpen(false);
      toast.error(t("admin.employerDetail.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSuspension = async () => {
    if (!employer) {
      return;
    }

    const nextSuspended = employer.status !== "Suspended";
    setSavingSuspension(true);
    try {
      const response = await setAdminEmployerSuspension(employer.id, nextSuspended);
      setEmployer(response.data);
      toast.success(
        nextSuspended
          ? t("admin.employerDetail.suspendedSuccess")
          : t("admin.employerDetail.unsuspendedSuccess"),
      );
    } catch {
      toast.error(t("admin.employerDetail.saveError"));
    } finally {
      setSavingSuspension(false);
    }
  };

  const handleSaveNotes = async (event: FormEvent) => {
    event.preventDefault();
    if (!employer) {
      return;
    }

    setSavingNotes(true);
    try {
      const response = await setAdminEmployerNotes(employer.id, notesDraft.trim() || null);
      setEmployer(response.data);
      setNotesDraft(response.data.adminNotes ?? "");
      toast.success(t("admin.employerDetail.notesSaved"));
    } catch {
      toast.error(t("admin.employerDetail.saveError"));
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return <p className={styles.loading}>{t("common.loading")}</p>;
  }

  if (!employer) {
    return (
      <div>
        <p className={styles.error}>{t("admin.employerDetail.notFound")}</p>
        <Link to="/admin/employers" className={styles.backLink}>
          {t("admin.employerDetail.backToList")}
        </Link>
      </div>
    );
  }

  const jobPosts = employer.jobPosts ?? [];
  const branches = employer.branches ?? [];
  const billingTransactions = employer.billingTransactions ?? [];
  const isSuspended = employer.status === "Suspended";

  const renderOverview = () => (
    <div className={styles.grid}>
      <article className={styles.card}>
        <h3 className={styles.cardTitle}>{t("admin.employerDetail.basicInfo")}</h3>
        <div className={styles.infoList}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employers.columns.pib")}</span>
            <span className={styles.infoValue}>{employer.pib}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>MB</span>
            <span className={styles.infoValue}>{employer.mb}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employers.columns.created")}</span>
            <span className={styles.infoValue}>
              {employer.createdAtUtc ? formatDisplayDate(employer.createdAtUtc) : "—"}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employerDetail.address")}</span>
            <span className={styles.infoValue}>
              {employer.streetName} {employer.streetNumber}, {employer.city}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employers.columns.status")}</span>
            <span className={styles.infoValue}>
              <AdminStatusBadge kind={isSuspended ? "suspended" : "active"} />
            </span>
          </div>
        </div>
        <button
          type="button"
          className={isSuspended ? styles.secondaryAction : styles.dangerAction}
          disabled={savingSuspension}
          onClick={() => void handleToggleSuspension()}
        >
          {savingSuspension
            ? t("common.loading")
            : isSuspended
              ? t("admin.employerDetail.unsuspend")
              : t("admin.employerDetail.suspend")}
        </button>
      </article>

      <article className={styles.card}>
        <h3 className={styles.cardTitle}>{t("admin.employerDetail.verification")}</h3>
        <div className={styles.verificationRow}>
          {employer.isVerifiedEmployer ? <AdminStatusBadge kind="verified" /> : <AdminStatusBadge kind="notVerified" />}
          <button
            type="button"
            className={`${styles.toggle} ${employer.isVerifiedEmployer ? styles.toggleOn : ""}`}
            aria-pressed={employer.isVerifiedEmployer}
            aria-label={t("admin.verification.toggleLabel")}
            onClick={() => openVerificationModal(!employer.isVerifiedEmployer)}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        {employer.isVerifiedEmployer ? (
          <>
            <div className={styles.infoList} style={{ marginTop: "0.85rem" }}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t("admin.employerDetail.verifiedBy")}</span>
                <span className={styles.infoValue}>{employer.verifiedByLabel ?? "Admin"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t("admin.employerDetail.verifiedAt")}</span>
                <span className={styles.infoValue}>
                  {employer.verifiedAtUtc ? formatDisplayDate(employer.verifiedAtUtc) : "—"}
                </span>
              </div>
            </div>
            <p className={styles.helperText}>{t("admin.verification.helperText")}</p>
          </>
        ) : null}
      </article>

      <article className={styles.card}>
        <h3 className={styles.cardTitle}>{t("admin.employerDetail.statistics")}</h3>
        <div className={styles.infoList}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employerDetail.activePosts")}</span>
            <span className={styles.infoValue}>{employer.activeJobPostsCount}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employerDetail.totalPosts")}</span>
            <span className={styles.infoValue}>{employer.totalJobPostsCount}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employerDetail.completedShifts")}</span>
            <span className={styles.infoValue}>{employer.completedShiftsCount}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employerDetail.acceptedCandidates")}</span>
            <span className={styles.infoValue}>{employer.acceptedCandidatesAllTime}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employerDetail.averageRating")}</span>
            <span className={styles.infoValue}>
              {employer.averageRating != null ? `${employer.averageRating.toFixed(1)} (${employer.reviewCount})` : "—"}
            </span>
          </div>
        </div>
      </article>

      <article className={styles.card}>
        <h3 className={styles.cardTitle}>{t("admin.employerDetail.billing")}</h3>
        <div className={styles.infoList}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employerDetail.subscription")}</span>
            <span className={styles.infoValue}>{employer.subscriptionPlanName ?? employer.billingStatus}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employerDetail.subscriptionExpiry")}</span>
            <span className={styles.infoValue}>
              {employer.subscriptionStop ? formatDisplayDate(employer.subscriptionStop) : "—"}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("admin.employerDetail.walletBalance")}</span>
            <span className={styles.infoValue}>{employer.walletBalance.toLocaleString()} RSD</span>
          </div>
        </div>
      </article>
    </div>
  );

  const renderJobPosts = () => (
    <div className={styles.tableCard}>
      {jobPosts.length === 0 ? (
        <p className={styles.emptyState}>{t("admin.employerDetail.emptyJobPosts")}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("admin.jobPosts.columns.title")}</th>
              <th>{t("admin.employers.columns.status")}</th>
              <th>{t("admin.employerDetail.startingDate")}</th>
              <th>{t("admin.candidates.columns.applications")}</th>
            </tr>
          </thead>
          <tbody>
            {jobPosts.map((post) => (
              <tr key={post.id}>
                <td>
                  <strong>{post.title}</strong>
                  <div className={styles.subtle}>{post.position}</div>
                </td>
                <td>{post.status}</td>
                <td>{post.startingDate ? formatDisplayDateTime(post.startingDate) : "—"}</td>
                <td>{post.applicationsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderBranches = () => (
    <div className={styles.tableCard}>
      {branches.length === 0 ? (
        <p className={styles.emptyState}>{t("admin.employerDetail.emptyBranches")}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("admin.restaurants.columns.name")}</th>
              <th>{t("admin.employers.columns.city")}</th>
              <th>{t("admin.candidates.columns.phone")}</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id}>
                <td>{branch.name}</td>
                <td>{branch.city}</td>
                <td>{branch.phoneNumber || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderBilling = () => (
    <div className={styles.tableCard}>
      {billingTransactions.length === 0 ? (
        <p className={styles.emptyState}>{t("admin.employerDetail.emptyBilling")}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("admin.billing.columns.type")}</th>
              <th>{t("admin.billing.columns.amount")}</th>
              <th>{t("admin.billing.columns.date")}</th>
            </tr>
          </thead>
          <tbody>
            {billingTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <strong>{tx.type}</strong>
                  {tx.description ? <div className={styles.subtle}>{tx.description}</div> : null}
                </td>
                <td>{tx.amount.toLocaleString()} RSD</td>
                <td>{formatDisplayDateTime(tx.createdAtUtc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderNotes = () => (
    <form className={styles.notesCard} onSubmit={(event) => void handleSaveNotes(event)}>
      <label className={styles.notesLabel} htmlFor="admin-employer-notes">
        {t("admin.employerDetail.notesLabel")}
      </label>
      <textarea
        id="admin-employer-notes"
        className={styles.notesInput}
        value={notesDraft}
        maxLength={4000}
        rows={8}
        onChange={(event) => setNotesDraft(event.target.value)}
        placeholder={t("admin.employerDetail.notesPlaceholder")}
      />
      <button type="submit" className={styles.primaryAction} disabled={savingNotes}>
        {savingNotes ? t("common.loading") : t("admin.employerDetail.saveNotes")}
      </button>
    </form>
  );

  return (
    <div className={styles.page}>
      <Link to="/admin/employers" className={styles.backLink}>
        ← {t("admin.employerDetail.backToList")}
      </Link>

      <section className={styles.headerCard}>
        <div className={styles.headerIdentity}>
          {employer.profilePhoto ? (
            <img src={employer.profilePhoto} alt="" className={styles.avatar} />
          ) : (
            <span className={`${styles.avatar} ${styles.avatarFallback}`}>{employer.name.charAt(0).toUpperCase()}</span>
          )}
          <div>
            <h2 className={styles.headerTitle}>{employer.name}</h2>
            <p className={styles.headerMeta}>{employer.city}</p>
            <p className={styles.headerContact}>
              {employer.email} · {employer.phoneNumber}
            </p>
            <div className={styles.headerBadges}>
              {employer.isVerifiedEmployer ? <AdminStatusBadge kind="verified" /> : null}
              <AdminStatusBadge kind={isSuspended ? "suspended" : "active"} />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? renderOverview() : null}
      {activeTab === "jobPosts" ? renderJobPosts() : null}
      {activeTab === "branches" ? renderBranches() : null}
      {activeTab === "statistics" ? renderOverview() : null}
      {activeTab === "billing" ? renderBilling() : null}
      {activeTab === "notes" ? renderNotes() : null}

      <AdminVerificationModal
        open={modalOpen}
        mode={modalMode}
        employerName={employer.name}
        verifying={saving}
        onConfirm={() => void handleConfirmVerification()}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default AdminEmployerDetailPage;
