import { NavLink } from "react-router-dom";
import {
  BuildingStorefrontIcon,
  HomeIcon,
  NewspaperIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  HomeIcon as HomeIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import styles from "../CandidateLayout/CandidateMobileNav.module.scss";

const GuestMobileNav = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: "/", label: t("nav.home"), Icon: HomeIcon, ActiveIcon: HomeIconSolid, end: true },
    { to: "/oglasi-za-posao", label: t("nav.jobPosts"), Icon: NewspaperIcon, ActiveIcon: NewspaperIconSolid },
    {
      to: "/restaurants",
      label: t("header.restaurants"),
      Icon: BuildingStorefrontIcon,
      ActiveIcon: BuildingStorefrontIconSolid,
    },
    { to: "/login", label: t("publicBrowse.signIn"), Icon: UserIcon, ActiveIcon: UserIconSolid },
  ];

  return (
    <nav className={styles.bottomNav} aria-label={t("nav.quickNavigation")}>
      {navItems.map(({ to, label, Icon, ActiveIcon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
          }
        >
          {({ isActive }) => (
            <span className={styles.navItemInner}>
              {isActive ? <ActiveIcon className={styles.navIcon} /> : <Icon className={styles.navIcon} />}
              <span className={styles.navLabel}>{label}</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default GuestMobileNav;
