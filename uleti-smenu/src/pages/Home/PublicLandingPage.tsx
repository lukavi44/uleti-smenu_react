import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Footer from "../../components/Footer/Footer";
import MarketingSection from "../../components/Home/MarketingSection";
import HeroPlatformStats from "../../components/Home/HeroPlatformStats";
import styles from "./PublicLandingPage.module.scss";

const SHIFT_PREVIEW_ITEMS = [
  { title: "Potreban šanker u Loft Promenadi - 15.03.", restaurant: "Loft - Coffee & Food Bar", date: "21.06.2026", salary: "5000 RSD", status: "completed" },
  { title: "Konobar Subota", restaurant: "Loft - Coffee & Food Bar", date: "26.06.2026", salary: "3000 RSD", status: "accepted" },
  { title: "Konobar Centar", restaurant: "Loft - Coffee & Food Bar", date: "28.06.2026", salary: "3500 RSD", status: "upcoming" },
  { title: "Pomoćni radnik", restaurant: "Bistro Central", date: "30.06.2026", salary: "3200 RSD", status: "upcoming" },
] as const;

type ShiftPreviewStatus = (typeof SHIFT_PREVIEW_ITEMS)[number]["status"];

const PublicLandingPage = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:768px)");
  const [shiftPage, setShiftPage] = useState(0);
  const shiftCardsPerPage = isMobile ? 1 : 3;
  const shiftPageCount = Math.ceil(SHIFT_PREVIEW_ITEMS.length / shiftCardsPerPage);
  const shiftStatusClassNames: Record<ShiftPreviewStatus, string> = {
    completed: styles.shiftStatusCompleted,
    accepted: styles.shiftStatusAccepted,
    upcoming: styles.shiftStatusUpcoming,
  };
  const visibleShiftItems = useMemo(
    () =>
      SHIFT_PREVIEW_ITEMS.slice(
        shiftPage * shiftCardsPerPage,
        shiftPage * shiftCardsPerPage + shiftCardsPerPage
      ),
    [shiftCardsPerPage, shiftPage]
  );

  const goToShiftPage = (nextPage: number) => {
    setShiftPage((nextPage + shiftPageCount) % shiftPageCount);
  };

  useEffect(() => {
    setShiftPage((currentPage) => Math.min(currentPage, shiftPageCount - 1));
  }, [shiftPageCount]);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={styles.heroOrbs} aria-hidden="true">
          <span className={styles.orbOne} />
          <span className={styles.orbTwo} />
        </div>
        <div className={styles.dotGrid} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>{t("home.heroEyebrow")}</span>
            <h1 className={styles.heroTitle}>{t("home.heroTitle")}</h1>
            <p className={styles.heroSubtitle}>{t("home.heroSubtitle")}</p>
            <p className={styles.heroDescription}>{t("home.heroDescription")}</p>

            <div className={styles.heroCtas}>
              <NavLink className={`${styles.button} ${styles.buttonPrimary}`} to="/registration/candidate">
                {t("home.heroCtaEmployee")}
              </NavLink>
              <NavLink className={`${styles.button} ${styles.buttonSecondary}`} to="/registration/employer">
                {t("home.heroCtaEmployer")}
              </NavLink>
            </div>

            <NavLink className={styles.heroLink} to="/how-it-works">
              {t("home.heroCtaHowItWorks")}
              <ArrowRightIcon className={styles.heroLinkIcon} aria-hidden="true" />
            </NavLink>

            {isMobile ? (
              <div className={styles.heroStatsMobile}>
                <HeroPlatformStats showIcons />
              </div>
            ) : null}
          </div>

          {!isMobile ? (
            <div className={styles.heroVisual}>
              <div className={styles.heroVisualCard}>
                <HeroPlatformStats compact showIcons />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.shiftPreviewSection}>
        <div className={styles.shiftPreviewInner}>
          <div className={styles.shiftPreviewHeader}>
            <div>
              <h2>{t("home.shiftPreviewTitle")}</h2>
              <p>{t("home.shiftPreviewSubtitle")}</p>
            </div>
            <NavLink className={styles.shiftPreviewLink} to="/registration/candidate">
              {t("home.shiftPreviewCta")}
            </NavLink>
          </div>

          <div className={styles.shiftCarousel}>
            <button
              type="button"
              className={styles.carouselArrow}
              onClick={() => goToShiftPage(shiftPage - 1)}
              aria-label={t("common.previous")}
            >
              <ChevronLeftIcon aria-hidden />
            </button>

            <div className={styles.shiftCardGrid}>
              {visibleShiftItems.map((item) => (
                <article key={item.title} className={styles.shiftPreviewCard}>
                  <div className={styles.shiftCardTop}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.restaurant}</p>
                    </div>
                    <span className={`${styles.shiftStatus} ${shiftStatusClassNames[item.status]}`}>
                      {t(`home.shiftPreviewStatus.${item.status}`)}
                    </span>
                  </div>
                  <div className={styles.shiftCardMeta}>
                    <span>
                      <CalendarDaysIcon aria-hidden />
                      {item.date}
                    </span>
                    <span>
                      <BanknotesIcon aria-hidden />
                      {item.salary}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className={styles.carouselArrow}
              onClick={() => goToShiftPage(shiftPage + 1)}
              aria-label={t("common.next")}
            >
              <ChevronRightIcon aria-hidden />
            </button>
          </div>

          <div className={styles.carouselDots} aria-hidden="true">
            {Array.from({ length: shiftPageCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={index === shiftPage ? styles.carouselDotActive : styles.carouselDot}
                onClick={() => setShiftPage(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <MarketingSection variant="landing" />
      <Footer variant="landing" />
    </>
  );
};

export default PublicLandingPage;
