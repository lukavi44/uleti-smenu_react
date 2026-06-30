import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AdminEmployerDetail } from "../../models/Admin.model";
import { getAdminEmployerDetail, setAdminEmployerVerification } from "../../services/admin-service";
import AdminStatusBadge from "../../components/Admin/AdminStatusBadge";
import AdminVerificationModal from "../../components/Admin/AdminVerificationModal";
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

  useEffect(() => {
    const loadEmployer = async () => {
      setLoading(true);
      try {
        const response = await getAdminEmployerDetail(employerId);
        setEmployer(response.data);
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
      if (pendingVerified) {
        setModalMode("success");
      } else {
        setModalOpen(false);
      }
    } catch {
      setModalOpen(false);
    } finally {
      setSaving(false);
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
              {employer.createdAtUtc ? new Date(employer.createdAtUtc).toLocaleDateString() : "—"}
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
              <AdminStatusBadge kind={employer.status === "Suspended" ? "suspended" : "active"} />
            </span>
          </div>
        </div>
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
                  {employer.verifiedAtUtc ? new Date(employer.verifiedAtUtc).toLocaleDateString() : "—"}
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
              {employer.subscriptionStop ? new Date(employer.subscriptionStop).toLocaleDateString() : "—"}
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

  const renderPlaceholder = (tabLabel: string) => (
    <div className={styles.placeholderPanel}>{t("admin.placeholder.comingSoon", { section: tabLabel })}</div>
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
            {employer.isVerifiedEmployer ? <AdminStatusBadge kind="verified" /> : null}
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
      {activeTab === "jobPosts" ? renderPlaceholder(t("admin.employerDetail.tabs.jobPosts")) : null}
      {activeTab === "branches" ? renderPlaceholder(t("admin.employerDetail.tabs.branches")) : null}
      {activeTab === "statistics" ? renderOverview() : null}
      {activeTab === "billing" ? renderPlaceholder(t("admin.employerDetail.tabs.billing")) : null}
      {activeTab === "notes" ? renderPlaceholder(t("admin.employerDetail.tabs.notes")) : null}

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
