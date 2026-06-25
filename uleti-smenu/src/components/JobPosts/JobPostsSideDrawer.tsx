import { ReactNode, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import styles from "./JobPostsSideDrawer.module.scss";

type JobPostsSideDrawerProps = {
  isOpen: boolean;
  title: string;
  ariaLabel?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  flushBody?: boolean;
};

const JobPostsSideDrawer = ({
  isOpen,
  title,
  ariaLabel,
  onClose,
  children,
  footer,
  wide = false,
  flushBody = false,
}: JobPostsSideDrawerProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label={t("common.close")}
        onClick={onClose}
      />
      <aside
        className={`${styles.panel} ${wide ? styles.panelWide : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
      >
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{title}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label={t("common.close")}>
            <XMarkIcon />
          </button>
        </div>

        <div className={`${styles.panelBody} ${flushBody ? styles.panelBodyFlush : ""}`}>{children}</div>

        {footer ? <div className={styles.panelFooter}>{footer}</div> : null}
      </aside>
    </div>
  );
};

export default JobPostsSideDrawer;
