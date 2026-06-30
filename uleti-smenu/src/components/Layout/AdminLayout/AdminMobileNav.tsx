import { NavLink, useLocation } from "react-router-dom";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon as EllipsisHorizontalIconSolid } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { getAdminMobileNavItems } from "../../../helpers/adminNav";
import styles from "./AdminMobileNav.module.scss";

type AdminMobileNavProps = {
  onOpenMenu: () => void;
};

const AdminMobileNav = ({ onOpenMenu }: AdminMobileNavProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navItems = getAdminMobileNavItems(t);

  const drawerPaths = [
    "/admin/restaurants",
    "/admin/applications",
    "/admin/billing",
    "/admin/reports",
    "/admin/settings",
  ];
  const isMoreActive = drawerPaths.some((path) => location.pathname.startsWith(path));

  return (
    <nav className={styles.bottomNav} aria-label={t("nav.quickNavigation")}>
      {navItems.map(({ to, labelKey, Icon, ActiveIcon, end }) => (
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
              <span className={styles.navLabel}>{labelKey}</span>
            </span>
          )}
        </NavLink>
      ))}

      <button
        type="button"
        className={`${styles.moreButton} ${isMoreActive ? styles.moreButtonActive : ""}`}
        onClick={onOpenMenu}
        aria-label={t("admin.nav.more")}
      >
        <span className={styles.navItemInner}>
          {isMoreActive ? (
            <EllipsisHorizontalIconSolid className={styles.navIcon} />
          ) : (
            <EllipsisHorizontalIcon className={styles.navIcon} />
          )}
          <span className={styles.navLabel}>{t("admin.nav.more")}</span>
        </span>
      </button>
    </nav>
  );
};

export default AdminMobileNav;
