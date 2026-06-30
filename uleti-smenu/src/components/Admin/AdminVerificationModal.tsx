import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import styles from "./AdminVerificationModal.module.scss";

type AdminVerificationModalProps = {
  open: boolean;
  mode: "confirm" | "success";
  employerName?: string;
  verifying: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const AdminVerificationModal = ({
  open,
  mode,
  employerName,
  verifying,
  onConfirm,
  onClose,
}: AdminVerificationModalProps) => {
  const { t } = useTranslation();

  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.iconWrap}>
          <ShieldCheckIcon className={styles.icon} />
        </div>

        {mode === "success" ? (
          <>
            <h2 className={styles.successTitle}>{t("admin.verification.successTitle")}</h2>
            <button type="button" className={styles.primaryButton} onClick={onClose}>
              {t("common.ok")}
            </button>
          </>
        ) : (
          <>
            <h2 className={styles.title}>{t("admin.verification.modalTitle")}</h2>
            <p className={styles.message}>
              {employerName
                ? t("admin.verification.modalTextNamed", { name: employerName })
                : t("admin.verification.modalText")}
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={verifying}>
                {t("common.cancel")}
              </button>
              <button type="button" className={styles.primaryButton} onClick={onConfirm} disabled={verifying}>
                {t("admin.verification.confirm")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationModal;
