import { Navigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useContext } from "react";
import Footer from "../../components/Footer/Footer";
import JobPosts from "../JobPosts/JobPosts";
import styles from "./Home.module.scss";
import EmployersList from "../../components/Employers/EmployersList";
import { AuthContext } from "../../store/Auth-context";
import MarketingSection from "../../components/Home/MarketingSection";
import HeroPlatformStats from "../../components/Home/HeroPlatformStats";
import { useTranslation } from "react-i18next";
import EmployeeDashboard from "../EmployeeDashboard/EmployeeDashboard";
import EmployerDashboard from "../EmployerDashboard/EmployerDashboard";
import PublicLandingPage from "./PublicLandingPage";

const HomePage = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { authStatus, role } = useContext(AuthContext);
  const canSeeEmployersCarousel =
    authStatus === "authenticated" && role === "Employee";

  if (authStatus === "authenticated" && role === "Employee") {
    return <EmployeeDashboard />;
  }

  if (authStatus === "authenticated" && role === "Employer") {
    return <EmployerDashboard />;
  }

  if (authStatus === "authenticated" && role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  if (authStatus === "unauthenticated") {
    return <PublicLandingPage />;
  }

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={styles.heroOrbs} aria-hidden="true">
          <span className={styles.orbOne} />
          <span className={styles.orbTwo} />
          <span className={styles.orbThree} />
        </div>

        <div className={styles.heroInner}>
          <div className={`${styles.heroContent} ${styles.heroAnimate}`}>
            <span className={styles.heroEyebrow}>{t("home.heroEyebrow")}</span>
            <h1 className={styles.heroTitle}>{t("home.heroTitle")}</h1>
            <p className={styles.heroSubtitle}>{t("home.heroSubtitle")}</p>
            {isMobile && <HeroPlatformStats />}
          </div>

          {!isMobile && (
            <div className={styles.heroVisual}>
              <div className={styles.heroVisualCard}>
                <HeroPlatformStats compact />
              </div>
            </div>
          )}
        </div>
      </section>
      <MarketingSection />
      {!isMobile && canSeeEmployersCarousel && (
        <section className={styles.employers}>
          <div className={styles.employersBackdrop} aria-hidden="true" />
          <div className={styles.employersOrbs} aria-hidden="true">
            <span className={styles.employersOrbOne} />
            <span className={styles.employersOrbTwo} />
          </div>
          <div className={styles.employersInner}>
            <EmployersList />
          </div>
        </section>
      )}
      {isMobile && <JobPosts />}
      <Footer />
    </>
  );
};

export default HomePage;
