import Layout from "./Layout";
import styles from "./ConfirmActionDialog.module.scss";
import { useTranslation } from "react-i18next";

export interface ConfirmActionDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmActionDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  isLoading = false,
  variant = "danger",
  onConfirm,
  onClose,
}: ConfirmActionDialogProps) => {
  const { t } = useTranslation();

  return (
    <Layout onClose={onClose} className={styles.wrapper}>
      <div
        className={styles.dialogContent}
        role="alertdialog"
        aria-labelledby="confirm-action-title"
        aria-describedby="confirm-action-message"
      >
        <h3 id="confirm-action-title" className={styles.title}>
          {title}
        </h3>
        <p id="confirm-action-message" className={styles.message}>
          {message}
        </p>
        <div className={styles.buttons}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelBtn}
            disabled={isLoading}
          >
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={variant === "danger" ? styles.confirmBtnDanger : styles.confirmBtn}
            disabled={isLoading}
          >
            {isLoading ? t("common.loading") : (confirmLabel ?? t("dialogs.confirm"))}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmActionDialog;
