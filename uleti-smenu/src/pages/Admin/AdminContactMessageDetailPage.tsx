import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AdminContactMessageDetail } from "../../models/Admin.model";
import { getAdminContactMessage, resolveAdminContactMessage } from "../../services/admin-service";
import { formatDisplayDateTime } from "../../helpers/formatDisplayDateTime";
import styles from "./AdminContactMessageDetailPage.module.scss";

const AdminContactMessageDetailPage = () => {
  const { t } = useTranslation();
  const { messageId = "" } = useParams();
  const [message, setMessage] = useState<AdminContactMessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getAdminContactMessage(messageId);
        setMessage(response.data);
        setNotes(response.data.adminNotes ?? "");
      } catch {
        setMessage(null);
      } finally {
        setLoading(false);
      }
    };

    if (messageId) {
      void load();
    }
  }, [messageId]);

  const statusLabel = (status: string) => {
    const key = `admin.contactMessages.status.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const handleResolve = async (event: FormEvent) => {
    event.preventDefault();
    if (!message) {
      return;
    }

    setResolving(true);
    try {
      const response = await resolveAdminContactMessage(message.id, notes.trim() || null);
      setMessage(response.data);
      setNotes(response.data.adminNotes ?? "");
      toast.success(t("admin.contactMessages.resolveSuccess"));
    } catch {
      toast.error(t("admin.contactMessages.resolveError"));
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return <p className={styles.emptyState}>{t("common.loading")}</p>;
  }

  if (!message) {
    return (
      <div className={styles.page}>
        <Link to="/admin/contact-messages" className={styles.backLink}>
          ← {t("admin.contactMessages.backToList")}
        </Link>
        <p className={styles.emptyState}>{t("admin.contactMessages.notFound")}</p>
      </div>
    );
  }

  const mailto = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;

  return (
    <div className={styles.page}>
      <Link to="/admin/contact-messages" className={styles.backLink}>
        ← {t("admin.contactMessages.backToList")}
      </Link>

      <section className={styles.headerCard}>
        <div>
          <h2 className={styles.headerTitle}>{message.subject}</h2>
          <p className={styles.headerMeta}>
            {message.name} · <a href={mailto}>{message.email}</a>
          </p>
          <p className={styles.headerMeta}>{formatDisplayDateTime(message.createdAtUtc)}</p>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${message.status === "Open" ? styles.badgeOpen : ""}`}>
              {statusLabel(message.status)}
            </span>
            <span className={styles.badge}>
              {message.emailSent
                ? t("admin.contactMessages.emailSent")
                : t("admin.contactMessages.emailNotSent")}
            </span>
          </div>
        </div>
        <a className={styles.secondaryAction} href={mailto}>
          {t("admin.contactMessages.replyMailto")}
        </a>
      </section>

      <section className={styles.panel}>
        <h3>{t("admin.contactMessages.messageBody")}</h3>
        <p className={styles.body}>{message.message}</p>
      </section>

      {message.status === "Open" ? (
        <form className={styles.panel} onSubmit={(event) => void handleResolve(event)}>
          <label className={styles.label} htmlFor="contact-notes">
            {t("admin.contactMessages.notes")}
          </label>
          <textarea
            id="contact-notes"
            className={styles.textarea}
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={t("admin.contactMessages.notesPlaceholder")}
          />
          <button type="submit" className={styles.primaryAction} disabled={resolving}>
            {resolving ? t("common.loading") : t("admin.contactMessages.resolve")}
          </button>
        </form>
      ) : (
        <section className={styles.panel}>
          <p className={styles.headerMeta}>
            {statusLabel(message.status)}
            {message.resolvedAtUtc ? ` · ${formatDisplayDateTime(message.resolvedAtUtc)}` : ""}
          </p>
          {message.adminNotes ? <p className={styles.body}>{message.adminNotes}</p> : null}
        </section>
      )}
    </div>
  );
};

export default AdminContactMessageDetailPage;
