import { ReactNode, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../../store/Auth-context";
import { GetMyUnreadChatCount } from "../../../services/chat-service";
import { subscribeChatUnreadCount, startRealtimeConnection } from "../../../services/realtime-service";
import EmployerSidebar from "./EmployerSidebar";
import EmployerTopBar from "./EmployerTopBar";
import EmployerMobileNav from "./EmployerMobileNav";
import styles from "./EmployerLayout.module.scss";

type EmployerLayoutProps = {
  children: ReactNode;
};

const EmployerLayout = ({ children }: EmployerLayoutProps) => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const isDashboard = location.pathname === "/";

  useEffect(() => {
    void startRealtimeConnection();

    const loadUnread = async () => {
      try {
        const response = await GetMyUnreadChatCount();
        setUnreadChatCount(response.data.count);
      } catch {
        setUnreadChatCount(0);
      }
    };

    void loadUnread();
    const unsubscribe = subscribeChatUnreadCount((count) => setUnreadChatCount(count));
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className={styles.shell}>
      <EmployerSidebar unreadChatCount={unreadChatCount} onLogout={() => void logout()} />
      <div className={styles.contentColumn}>
        <main className={styles.main}>
          {isDashboard ? <EmployerTopBar /> : null}
          {children}
        </main>
      </div>
      <EmployerMobileNav unreadChatCount={unreadChatCount} />
    </div>
  );
};

export default EmployerLayout;
