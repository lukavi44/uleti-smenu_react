import ReactDOM from "react-dom";
import styles from "./Modal.module.scss";

const portalDiv = document.getElementById("portal") as HTMLElement;

export interface LayoutProps {
  children: React.ReactNode;
  onClose: React.MouseEventHandler;
  className?: string;
  overlay?: boolean;
  style?: React.CSSProperties;
}

const Layout = ({
  children,
  onClose,
  className,
  overlay,
  style,
}: LayoutProps) => {
  return ReactDOM.createPortal(
    <>
      {overlay && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.modal} ${className}`} style={style}>
        {children}
      </div>
    </>,
    portalDiv
  );
};

export default Layout;
