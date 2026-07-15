import { ReactNode, useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../../store/Auth-context";
import { useUnreadChatCount } from "../../../hooks/useUnreadChatCount";
import { isChatDetailPath } from "../../../helpers/chatRoutes";
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
  const unreadChatCount = useUnreadChatCount();
  const isDashboard = location.pathname === "/";
  const isChatDetail = isChatDetailPath(location.pathname);
  const isMessagesList = location.pathname === "/messages";

  const isChatSurface = isMessagesList || isChatDetail;

  return (
    <div className={`${styles.shell} ${isChatSurface ? styles.shellChat : ""}`}>
      <CandidateSidebar unreadChatCount={unreadChatCount} onLogout={() => void logout()} />
      <div className={styles.contentColumn}>
        <main
          className={`${styles.main} ${isChatDetail ? styles.mainChatDetail : ""} ${isMessagesList ? styles.mainMessagesList : ""}`}
        >
          {isDashboard ? <CandidateTopBar /> : null}
          {children}
        </main>
      </div>
      {!isChatDetail ? <CandidateMobileNav unreadChatCount={unreadChatCount} /> : null}
    </div>
  );
};

export default CandidateLayout;
