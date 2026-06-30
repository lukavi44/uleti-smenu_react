import { ReactNode, useContext, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../store/Auth-context";
import AdminSidebar from "./AdminSidebar";
import AdminMobileHeader from "./AdminMobileHeader";
import AdminMobileNav from "./AdminMobileNav";
import AdminNavDrawer from "./AdminNavDrawer";
import styles from "./AdminLayout.module.scss";

type AdminLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pageTitle = useMemo(() => {
    if (title) {
      return title;
    }

    if (location.pathname.startsWith("/admin/employers/")) {
      return t("admin.pages.employerDetail");
    }

    const titles: Record<string, string> = {
      "/admin": t("admin.pages.dashboard"),
      "/admin/candidates": t("admin.pages.candidates"),
      "/admin/employers": t("admin.pages.employers"),
      "/admin/restaurants": t("admin.pages.restaurants"),
      "/admin/job-posts": t("admin.pages.jobPosts"),
      "/admin/applications": t("admin.pages.applications"),
      "/admin/billing": t("admin.pages.billing"),
      "/admin/reports": t("admin.pages.reports"),
      "/admin/settings": t("admin.pages.settings"),
    };

    return titles[location.pathname] ?? t("admin.pages.dashboard");
  }, [location.pathname, t, title]);

  const handleLogout = () => {
    void logout();
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar onLogout={handleLogout} />
      <AdminNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onLogout={handleLogout} />

      <div className={styles.contentColumn}>
        <main className={styles.main}>
          <AdminMobileHeader title={pageTitle} onOpenMenu={() => setDrawerOpen(true)} />

          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            {subtitle ? <p className={styles.pageSubtitle}>{subtitle}</p> : null}
          </header>

          {children}
        </main>
      </div>

      <AdminMobileNav onOpenMenu={() => setDrawerOpen(true)} />
    </div>
  );
};

export default AdminLayout;
