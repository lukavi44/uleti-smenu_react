import { ReactNode, useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../../store/Auth-context";
import { useUnreadChatCount } from "../../../hooks/useUnreadChatCount";
import { isEmployerCandidateDetailPath } from "../../../helpers/candidateRoutes";
import { isChatDetailPath } from "../../../helpers/chatRoutes";
import { isEmployerJobPostDetailPath } from "../../../helpers/jobPostRoutes";
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
  const unreadChatCount = useUnreadChatCount();
  const isDashboard = location.pathname === "/";
  const isChatDetail = isChatDetailPath(location.pathname);
  const isCandidateDetail = isEmployerCandidateDetailPath(location.pathname);
  const isJobPostDetail = isEmployerJobPostDetailPath(location.pathname);
  const isMessagesList = location.pathname === "/messages";
  const isJobPostsList = location.pathname === "/oglasi-za-posao";

  const isChatSurface = isMessagesList || isChatDetail;

  return (
    <div className={`${styles.shell} ${isChatSurface ? styles.shellChat : ""}`}>
      <EmployerSidebar unreadChatCount={unreadChatCount} onLogout={() => void logout()} />
      <div className={styles.contentColumn}>
        <main
          className={`${styles.main} ${isChatDetail ? styles.mainChatDetail : ""} ${isJobPostDetail ? styles.mainJobPostDetail : ""} ${isCandidateDetail ? styles.mainCandidateDetail : ""} ${isMessagesList ? styles.mainMessagesList : ""} ${isJobPostsList ? styles.mainJobPostsList : ""}`}
        >
          {!isChatDetail && !isJobPostDetail && !isCandidateDetail ? <EmployerMobileHeader /> : null}
          {isDashboard ? <EmployerTopBar /> : null}
          {children}
        </main>
      </div>
      {!isChatDetail ? <EmployerMobileNav unreadChatCount={unreadChatCount} /> : null}    </div>
  );
};

export default EmployerLayout;
