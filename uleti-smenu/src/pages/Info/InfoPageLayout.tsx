import { ReactNode } from "react";
import Footer from "../../components/Footer/Footer";
import ShellPageHeader from "../../components/Layout/ShellPageHeader";
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
        <ShellPageHeader title={title} subtitle={intro} />
        <div className={styles.content}>{children}</div>
      </div>
      <Footer variant="landing" />
    </>
  );
};

export default InfoPageLayout;
