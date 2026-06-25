import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import GuestSidebar from "./GuestSidebar";
import GuestMobileNav from "./GuestMobileNav";
import styles from "./GuestLayout.module.scss";

type GuestLayoutProps = {
  children: ReactNode;
};

const GuestLayout = ({ children }: GuestLayoutProps) => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className={styles.shell}>
      <GuestSidebar />
      <div className={styles.contentColumn}>
        <main className={`${styles.main} ${isLanding ? styles.mainLanding : ""}`}>{children}</main>
      </div>
      <GuestMobileNav />
    </div>
  );
};

export default GuestLayout;