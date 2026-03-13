import styles from "./ConfirmationDialog.module.scss";
import Layout from "./Layout";
import { useTranslation } from "react-i18next";

interface ConfirmationDialogProps {
  onConfirm: (e: any) => void;
  onClose: React.MouseEventHandler;
}

const ConfirmationDialog = ({
  onConfirm,
  onClose,
}: ConfirmationDialogProps) => {
  const { t } = useTranslation();
  return (
    <Layout
      onClose={onClose}
      className={styles.wrapper}
    >
      <div className={styles.dialogContent}>
        <p className={styles.message}>{t("dialogs.logoutConfirm")}</p>
        <div className={styles.buttons}>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            {t("dialogs.confirm")}
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmationDialog;
