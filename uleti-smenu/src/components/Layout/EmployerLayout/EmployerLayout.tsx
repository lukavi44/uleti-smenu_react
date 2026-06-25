import { ReactNode, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../../store/Auth-context";
import { GetMyUnreadChatCount } from "../../../services/chat-service";
import { subscribeChatUnreadCount, startRealtimeConnection } from "../../../services/realtime-service";
import { isChatDetailPath } from "../../../helpers/chatRoutes";
import EmployerSidebar from "./EmployerSidebar";
import EmployerTopBar from "./EmployerTopBar";
import EmployerMobileHeader from "./EmployerMobileHeader";
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
  const isChatDetail = isChatDetailPath(location.pathname);
  const isMessagesList = location.pathname === "/messages";

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
        <main
          className={`${styles.main} ${isChatDetail ? styles.mainChatDetail : ""} ${isMessagesList ? styles.mainMessagesList : ""}`}
        >
          {!isChatDetail ? <EmployerMobileHeader /> : null}
          {isDashboard ? <EmployerTopBar /> : null}
          {children}
        </main>
      </div>
      {!isChatDetail ? <EmployerMobileNav unreadChatCount={unreadChatCount} /> : null}    </div>
  );
};

export default EmployerLayout;
