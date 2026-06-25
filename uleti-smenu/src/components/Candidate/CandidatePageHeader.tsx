import { ReactNode } from "react";
import styles from "./CandidatePageHeader.module.scss";

type CandidatePageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

const CandidatePageHeader = ({ title, subtitle, action }: CandidatePageHeaderProps) => {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </header>
  );
};

export default CandidatePageHeader;
