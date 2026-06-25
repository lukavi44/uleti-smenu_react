import { ReactNode } from "react";
import Footer from "../../components/Footer/Footer";
import CandidatePageHeader from "../../components/Candidate/CandidatePageHeader";
import styles from "./InfoPageLayout.module.scss";

interface InfoPageLayoutProps {
  title: string;
  intro?: string;
  children: ReactNode;
}

const InfoPageLayout = ({ title, intro, children }: InfoPageLayoutProps) => {
  return (
    <>
      <div className={styles.page}>
        <CandidatePageHeader title={title} subtitle={intro} />
        <div className={styles.content}>{children}</div>
      </div>
      <Footer variant="landing" />
    </>
  );
};

export default InfoPageLayout;
