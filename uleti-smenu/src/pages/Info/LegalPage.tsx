import { useTranslation } from "react-i18next";
import InfoPageLayout from "./InfoPageLayout";
import styles from "./InfoPageLayout.module.scss";

export type LegalPageType = "terms" | "privacy" | "cookies";

interface LegalPageProps {
  type: LegalPageType;
}

const LEGAL_SECTIONS = [1, 2, 3] as const;

const LegalPage = ({ type }: LegalPageProps) => {
  const { t } = useTranslation();
  const prefix = `info.legal.${type}`;

  return (
    <InfoPageLayout title={t(`${prefix}.title`)} intro={t(`${prefix}.intro`)}>
      <p className={styles.legalUpdated}>{t("info.legal.lastUpdated")}</p>
      {LEGAL_SECTIONS.map((section) => (
        <section key={section} className={styles.section}>
          <h2>{t(`${prefix}.section${section}Title`)}</h2>
          <p>{t(`${prefix}.section${section}Text`)}</p>
        </section>
      ))}
    </InfoPageLayout>
  );
};

export default LegalPage;
