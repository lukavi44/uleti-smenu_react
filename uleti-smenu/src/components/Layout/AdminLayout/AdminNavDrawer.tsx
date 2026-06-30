import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminLogoutItem, getAdminNavItems } from "../../../helpers/adminNav";
import styles from "./AdminNavDrawer.module.scss";

type AdminNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const AdminNavDrawer = ({ open, onClose, onLogout }: AdminNavDrawerProps) => {
  const { t } = useTranslation();
  const navItems = getAdminNavItems(t);

  if (!open) {
    return null;
  }

  return (
    <>
      <button type="button" className={styles.backdrop} aria-label={t("common.close")} onClick={onClose} />
      <aside className={styles.drawer} aria-label={t("admin.shell.drawerNavigation")}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t("admin.shell.menuTitle")}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label={t("common.close")}>
            ×
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, labelKey, Icon, ActiveIcon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
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

        <button
          type="button"
          className={styles.logoutButton}
          onClick={() => {
            onClose();
            onLogout();
          }}
        >
          <adminLogoutItem.Icon className={styles.navIcon} />
          <span>{t(adminLogoutItem.labelKey)}</span>
        </button>
      </aside>
    </>
  );
};

export default AdminNavDrawer;
