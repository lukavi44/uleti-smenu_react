import styles from "./ConfirmationDialog.module.scss";
import Layout from "./Layout";

interface ConfirmationDialogProps {
  text: string;
  onConfirm: (e: any) => void;
  onClose: React.MouseEventHandler;
}

const ConfirmationDialog = ({
  text,
  onConfirm,
  onClose,
}: ConfirmationDialogProps) => {
  return (
    <Layout
      onClose={onClose}
      overlay={true}
      className={styles.confirmationDialog}
    >
      <div className={styles.dialogContent}>
        <p>{text}</p>
        <div className={styles.buttons}>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            Confirm
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmationDialog;
