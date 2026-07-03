import { ReactNode } from "react";
import styles from "./ShellPageHeader.module.scss";

type ShellPageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  dense?: boolean;
};

const ShellPageHeader = ({ title, subtitle, action, dense = false }: ShellPageHeaderProps) => {
  return (
    <header className={`${styles.header} ${dense ? styles.headerDense : ""}`}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </header>
  );
};

export default ShellPageHeader;
