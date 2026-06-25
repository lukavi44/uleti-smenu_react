import { NavLink } from "react-router-dom";
import {
  BuildingStorefrontIcon,
  HomeIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import {
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  HomeIcon as HomeIconSolid,
  NewspaperIcon as NewspaperIconSolid,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/logo.png";
import sidebarStyles from "../CandidateLayout/CandidateSidebar.module.scss";
import styles from "./GuestSidebar.module.scss";

const GuestSidebar = () => {
  const { t, i18n } = useTranslation();

  const navItems = [
    { to: "/", label: t("nav.home"), Icon: HomeIcon, ActiveIcon: HomeIconSolid, end: true },
    { to: "/oglasi-za-posao", label: t("nav.jobPosts"), Icon: NewspaperIcon, ActiveIcon: NewspaperIconSolid },
    {
      to: "/restaurants",
      label: t("header.restaurants"),
      Icon: BuildingStorefrontIcon,
      ActiveIcon: BuildingStorefrontIconSolid,
    },
  ];

  return (
    <aside className={sidebarStyles.sidebar} aria-label={t("guest.sidebarNavigation")}>
      <NavLink to="/" className={sidebarStyles.logoLink}>
        <img src={logo} alt="UletiSmenu" className={sidebarStyles.logo} />
      </NavLink>

      <nav className={sidebarStyles.nav}>
        {navItems.map(({ to, label, Icon, ActiveIcon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `${sidebarStyles.navItem} ${isActive ? sidebarStyles.navItemActive : ""}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <ActiveIcon className={sidebarStyles.navIcon} />
                ) : (
                  <Icon className={sidebarStyles.navIcon} />
                )}
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <label className={styles.languageField} htmlFor="guest-language">
          <span className={styles.languageLabel}>{t("common.language")}</span>
          <select
            id="guest-language"
            className={styles.languageSelect}
            value={i18n.language}
            onChange={(event) => void i18n.changeLanguage(event.target.value)}
          >
            <option value="sr">{t("common.serbian")}</option>
            <option value="en">{t("common.english")}</option>
          </select>
        </label>

        <div className={styles.authSection}>
          <NavLink to="/login" className={styles.signInLink}>
            {t("publicBrowse.signIn")}
          </NavLink>
          <NavLink to="/registration/candidate" className={styles.registerLink}>
            {t("publicBrowse.register")}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default GuestSidebar;
