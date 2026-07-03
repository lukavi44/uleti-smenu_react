import { useTranslation } from "react-i18next";
import InfoPageLayout from "./InfoPageLayout";
import styles from "./InfoPageLayout.module.scss";

const LEGAL_TYPES = ["terms", "privacy", "cookies"] as const;
const LEGAL_SECTION_IDS = {
  terms: "uslovi",
  privacy: "privatnost",
  cookies: "kolacici",
} as const;

const LEGAL_SECTIONS = [1, 2, 3, 4, 5, 6] as const;

const LegalHubPage = () => {
  const { t } = useTranslation();

  return (
    <InfoPageLayout title={t("info.legal.legalHub.title")} intro={t("info.legal.legalHub.intro")}>
      <div className={styles.legalDisclaimer} role="note">
        <strong>{t("info.legal.lawyerDisclaimer")}</strong>
      </div>
      <p className={styles.legalUpdated}>{t("info.legal.lastUpdated")}</p>

      {LEGAL_TYPES.map((type) => {
        const prefix = `info.legal.${type}`;
        const sectionId = LEGAL_SECTION_IDS[type];

        return (
          <section key={type} id={sectionId} className={`${styles.section} ${styles.legalBlock}`}>
            <h2>{t(`${prefix}.title`)}</h2>
            <p>{t(`${prefix}.intro`)}</p>
            {LEGAL_SECTIONS.map((section) => (
              <article key={section} className={styles.legalSubsection}>
                <h3>{t(`${prefix}.section${section}Title`)}</h3>
                <p>{t(`${prefix}.section${section}Text`)}</p>
              </article>
            ))}
          </section>
        );
      })}
    </InfoPageLayout>
  );
};

export default LegalHubPage;
