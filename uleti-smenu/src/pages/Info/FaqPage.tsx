import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import InfoPageLayout from "./InfoPageLayout";
import styles from "./InfoPageLayout.module.scss";

const FAQ_ITEMS = [1, 2, 3, 4, 5, 6] as const;

const FaqPage = () => {
  const { t } = useTranslation();

  return (
    <InfoPageLayout title={t("info.faq.title")} intro={t("info.faq.intro")}>
      <section className={styles.section}>
        {FAQ_ITEMS.map((item) => (
          <article key={item} className={styles.faqItem}>
            <h3>{t(`info.faq.q${item}`)}</h3>
            <p>{t(`info.faq.a${item}`)}</p>
          </article>
        ))}
      </section>
      <div className={styles.ctaRow}>
        <Link className={styles.ctaSecondary} to="/how-it-works">
          {t("info.faq.ctaHowItWorks")}
        </Link>
      </div>
    </InfoPageLayout>
  );
};

export default FaqPage;
