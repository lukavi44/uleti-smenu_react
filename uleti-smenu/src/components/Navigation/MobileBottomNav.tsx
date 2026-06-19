import { NavLink, useLocation } from "react-router-dom";
import { HomeIcon, NewspaperIcon, UserIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import styles from "./MobileBottomNav.module.scss";

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const hiddenRoutes = ["/login", "/registration", "/registration-user"];
  if (hiddenRoutes.some((route) => location.pathname.startsWith(route))) {
    return null;
  }

  const navItems = [
    { to: "/", label: t("nav.home"), Icon: HomeIcon, ActiveIcon: HomeIconSolid, end: true },
    { to: "/oglasi-za-posao", label: t("nav.jobPosts"), Icon: NewspaperIcon, ActiveIcon: NewspaperIconSolid },
    { to: "/profile", label: t("nav.profile"), Icon: UserIcon, ActiveIcon: UserIconSolid },
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
            <>
              {isActive ? <ActiveIcon className={styles.navIcon} /> : <Icon className={styles.navIcon} />}
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
