import { NavLink } from "react-router-dom";

import styles from "./Footer.module.scss";
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../../assets/logo.png";
import { useTranslation } from "react-i18next";

interface FooterLink {
  label: string;
  to?: string;
  external?: boolean;
}

type FooterProps = {
  variant?: "default" | "landing";
};

const Footer = ({ variant = "default" }: FooterProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:768px)");
  const isLanding = variant === "landing";

  const footerSections: { title: string; links: FooterLink[] }[] = [
    {
      title: t("footer.platform"),
      links: [
        { label: t("footer.about"), to: "/about" },
        { label: t("footer.howItWorks"), to: "/how-it-works" },
        { label: t("footer.faq"), to: "/faq" },
      ],
    },
    {
      title: t("footer.forCandidates"),
      links: [
        { label: t("footer.findShift"), to: "/for-candidates" },
        { label: t("footer.howToApply"), to: "/how-it-works#candidates" },
        { label: t("footer.profileTips"), to: "/for-candidates" },
      ],
    },
    {
      title: t("footer.forRestaurants"),
      links: [
        { label: t("footer.postAd"), to: "/for-employers" },
        { label: t("footer.candidateOverview"), to: "/for-employers" },
        { label: t("footer.subscriptions"), to: "/for-employers#pricing" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.terms"), to: "/terms" },
        { label: t("footer.privacy"), to: "/privacy" },
        { label: t("footer.cookies"), to: "/cookies" },
      ],
    },
    {
      title: t("footer.contact"),
      links: [
        { label: "support@uletismenu.com", external: true },
        { label: "+381 11 123 456", external: true },
        { label: "Novi Sad, Srbija", external: true },
      ],
    },
  ];

  const renderFooterLink = (link: FooterLink) => {
    if (!link.to) {
      return <span>{link.label}</span>;
    }

    return (
      <NavLink to={link.to} className={styles.footerLink}>
        {link.label}
      </NavLink>
    );
  };

  if (isMobile) {
    return (
      <footer className={`${styles.mobileFooter} fixed bottom-0 left-0 w-full bg-blue-600 text-white text-center py-3 md:hidden flex justify-between p-5 gap-x-3`}>
        <NavLink to="/oglasi-za-posao">{t("header.posts")}</NavLink>
        <NavLink to="/for-candidates">{t("footer.candidates")}</NavLink>
        <NavLink to="/for-employers">{t("footer.employers")}</NavLink>
        <NavLink to="/profile">{t("header.profile")}</NavLink>
      </footer>
    );
  }

  if (isLanding) {
    return (
      <footer className={styles.landingFooter}>
        <div className={styles.landingInner}>
          <div className={styles.landingGrid}>
            <div className={styles.brandColumn}>
              <img src={logo} alt="UletiSmenu" className={styles.brandLogo} />
              <p className={styles.brandTagline}>{t("footer.tagline")}</p>
              <div className={styles.socialRow} aria-label={t("footer.social")}>
                <a className={styles.socialLink} href="https://instagram.com" target="_blank" rel="noreferrer">
                  IG
                </a>
                <a className={styles.socialLink} href="https://facebook.com" target="_blank" rel="noreferrer">
                  FB
                </a>
                <a className={styles.socialLink} href="https://linkedin.com" target="_blank" rel="noreferrer">
                  IN
                </a>
              </div>
            </div>

            {footerSections.map((section) => (
              <div key={section.title} className={styles.footerColumn}>
                <p className={styles.columnTitle}>{section.title}</p>
                <ul>
                  {section.links.map((link) => (
                    <li key={link.label}>{renderFooterLink(link)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className={styles.copyright}>
            © {new Date().getFullYear()} UletiSmenu. {t("footer.rights")}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <>
      <section className={styles.info}>
        <div className={styles.top}>
          <p>{t("footer.intro")}</p>
        </div>
        <div className={styles.bottom}>
          {footerSections.map((section) => (
            <div key={section.title} className={styles["footer-column"]}>
              <p className={styles["column-title"]}>{section.title}</p>
              <ul>
                {section.links.map((link) => (
                  <li key={link.label}>{renderFooterLink(link)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <footer className={styles["footer-desktop"]}>
        <div className={styles.left}>
          <img src={logo} alt="logo" width={250} />
        </div>
        <div className={styles.right}>
          © {new Date().getFullYear()} UletiSmenu. {t("footer.rights")}
        </div>
      </footer>
    </>
  );
};

export default Footer;
