import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import InfoPageLayout from "./InfoPageLayout";
import styles from "./InfoPageLayout.module.scss";

type AudienceTab = "candidates" | "employers";

const CANDIDATE_STEPS = [1, 2, 3, 4] as const;
const EMPLOYER_STEPS = [1, 2, 3, 4] as const;

const HowItWorksPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AudienceTab>("candidates");

  useEffect(() => {
    if (location.hash === "#employers") {
      setActiveTab("employers");
      return;
    }

    if (location.hash === "#candidates") {
      setActiveTab("candidates");
    }
  }, [location.hash]);

  const steps = activeTab === "candidates" ? CANDIDATE_STEPS : EMPLOYER_STEPS;
  const stepPrefix = activeTab === "candidates" ? "info.howItWorks.candidateStep" : "info.howItWorks.employerStep";

  return (
    <InfoPageLayout title={t("info.howItWorks.title")} intro={t("info.howItWorks.intro")}>
      <div className={styles.tabs}>
        <button
          type="button"
          id="candidates"
          className={`${styles.tab} ${activeTab === "candidates" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("candidates")}
        >
          {t("info.howItWorks.forCandidates")}
        </button>
        <button
          type="button"
          id="employers"
          className={`${styles.tab} ${activeTab === "employers" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("employers")}
        >
          {t("info.howItWorks.forEmployers")}
        </button>
      </div>

      {steps.map((step) => (
        <article key={`${activeTab}-${step}`} className={styles.card}>
          <span className={styles.stepNumber}>{step}</span>
          <h3>{t(`${stepPrefix}${step}Title`)}</h3>
          <p>{t(`${stepPrefix}${step}Text`)}</p>
        </article>
      ))}

      <div className={styles.ctaRow}>
        {activeTab === "candidates" ? (
          <>
            <Link className={styles.ctaPrimary} to="/registration/candidate">
              {t("info.howItWorks.ctaRegisterCandidate")}
            </Link>
            <Link className={styles.ctaSecondary} to="/za-kandidate#kako-funkcionise">
              {t("info.howItWorks.ctaCandidateGuide")}
            </Link>
          </>
        ) : (
          <>
            <Link className={styles.ctaPrimary} to="/registration/employer">
              {t("info.howItWorks.ctaRegisterEmployer")}
            </Link>
            <Link className={styles.ctaSecondary} to="/za-restorane">
              {t("info.howItWorks.ctaEmployerGuide")}
            </Link>
          </>
        )}
      </div>
    </InfoPageLayout>
  );
};

export default HowItWorksPage;
