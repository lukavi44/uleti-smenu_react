import { ReactNode } from "react";
import Footer from "../../components/Footer/Footer";
import styles from "./InfoPageLayout.module.scss";

interface InfoPageLayoutProps {
  title: string;
  intro?: string;
  children: ReactNode;
}

const InfoPageLayout = ({ title, intro, children }: InfoPageLayoutProps) => {
  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
        </header>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default InfoPageLayout;
