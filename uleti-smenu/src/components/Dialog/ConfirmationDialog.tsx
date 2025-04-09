import styles from "./ConfirmationDialog.module.scss";
import Layout from "./Layout";

interface ConfirmationDialogProps {
  onConfirm: (e: any) => void;
  onClose: React.MouseEventHandler;
}

const ConfirmationDialog = ({
  onConfirm,
  onClose,
}: ConfirmationDialogProps) => {
  return (
    <Layout
      onClose={onClose}
      className={styles.wrapper}
    >
      <div className={styles.dialogContent}>
        <p className={styles.message}>Da li ste sigurni da zelite da nastavite sa odjavom?</p>
        <div className={styles.buttons}>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            Potvrdi
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Otkaži
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmationDialog;
