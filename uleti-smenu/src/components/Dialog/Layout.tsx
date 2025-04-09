import ReactDOM from "react-dom";
import styles from "./Layout.module.scss";

const portalDiv = document.getElementById("portal") as HTMLElement;

export interface LayoutProps {
  children: React.ReactNode;
  onClose: React.MouseEventHandler;
  className?: string;
  style?: React.CSSProperties;
}

const Layout = ({
  children,
  onClose,
  className,
  style,
}: LayoutProps) => {
  return ReactDOM.createPortal(
    <div
      className={styles.backdrop}
      onClick={onClose}
    >
      <div
        className={`${styles.modal} ${className}`}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    portalDiv
  );
};

export default Layout;
