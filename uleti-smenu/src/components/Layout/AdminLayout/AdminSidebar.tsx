import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/logo.png";
import { adminLogoutItem, getAdminNavItems } from "../../../helpers/adminNav";
import styles from "./AdminSidebar.module.scss";

type AdminSidebarProps = {
  onLogout: () => void;
};

const AdminSidebar = ({ onLogout }: AdminSidebarProps) => {
  const { t } = useTranslation();
  const navItems = getAdminNavItems(t);

  return (
    <aside className={styles.sidebar} aria-label={t("admin.shell.sidebarNavigation")}>
      <div className={styles.brand}>
        <NavLink to="/admin" className={styles.logoLink}>
          <img src={logo} alt="UletiSmenu" className={styles.logo} />
        </NavLink>
        <p className={styles.brandLabel}>{t("admin.shell.panelLabel")}</p>
      </div>

      <nav className={styles.nav}>
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
              <>
                {isActive ? <ActiveIcon className={styles.navIcon} /> : <Icon className={styles.navIcon} />}
                <span>{labelKey}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button type="button" className={styles.logoutButton} onClick={onLogout}>
        <adminLogoutItem.Icon className={styles.navIcon} />
        <span>{t(adminLogoutItem.labelKey)}</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
