import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BriefcaseIcon } from "@heroicons/react/24/solid";
import logo from "../../assets/logo.png";
import loginVisual from "../../assets/restoran1.jpg";
import styles from "./AuthPageLayout.module.scss";

type AuthPageLayoutProps = {
  children: ReactNode;
  visualCaption?: string;
};

const AuthPageLayout = ({ children, visualCaption }: AuthPageLayoutProps) => {
  const { t } = useTranslation();
  const caption = visualCaption ?? t("login.visualCaption");

  return (
    <div className={styles.page}>
      <div className={styles.orbs} aria-hidden="true">
        <span className={styles.orbOne} />
        <span className={styles.orbTwo} />
        <span className={styles.orbThree} />
      </div>

      <Link to="/" className={styles.pageLogoLink} aria-label={t("nav.home")}>
        <img src={logo} alt="UletiSmenu" className={styles.pageLogo} />
      </Link>

      <div className={styles.card}>
        <section className={styles.formPanel}>
          <Link to="/" className={styles.formLogoLink} aria-label={t("nav.home")}>
            <img src={logo} alt="" className={styles.formLogo} />
          </Link>
          {children}
        </section>

        <aside className={styles.visualPanel} aria-hidden="true">
          <img src={loginVisual} alt="" className={styles.visualImage} />
          <div className={styles.visualCaption}>
            <span className={styles.visualIcon} aria-hidden="true">
              <BriefcaseIcon />
            </span>
            <span>{caption}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AuthPageLayout;
