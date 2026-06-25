import { ReactNode, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../../store/Auth-context";
import { GetMyUnreadChatCount } from "../../../services/chat-service";
import { subscribeChatUnreadCount, startRealtimeConnection } from "../../../services/realtime-service";
import CandidateSidebar from "./CandidateSidebar";
import CandidateTopBar from "./CandidateTopBar";
import CandidateMobileNav from "./CandidateMobileNav";
import styles from "./CandidateLayout.module.scss";

type CandidateLayoutProps = {
  children: ReactNode;
};

const CandidateLayout = ({ children }: CandidateLayoutProps) => {
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
      <CandidateSidebar unreadChatCount={unreadChatCount} onLogout={() => void logout()} />
      <div className={styles.contentColumn}>
        <main className={styles.main}>
          {isDashboard ? <CandidateTopBar /> : null}
          {children}
        </main>
      </div>
      <CandidateMobileNav unreadChatCount={unreadChatCount} />
    </div>
  );
};

export default CandidateLayout;
