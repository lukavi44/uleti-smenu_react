import { ReactNode } from "react";
import Header from "../Header/Header";
import MobileBottomNav from "../Navigation/MobileBottomNav";
import styles from "./AppShell.module.scss";

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>{children}</main>
      <MobileBottomNav />
    </div>
  );
};

export default AppShell;
