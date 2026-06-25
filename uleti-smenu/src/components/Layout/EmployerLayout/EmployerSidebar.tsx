import { NavLink } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  HomeIcon,
  NewspaperIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  HomeIcon as HomeIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/logo.png";
import styles from "./EmployerSidebar.module.scss";

type EmployerSidebarProps = {
  unreadChatCount: number;
  onLogout: () => void;
};

const EmployerSidebar = ({ unreadChatCount, onLogout }: EmployerSidebarProps) => {
  const { t } = useTranslation();

  const navItems = [
    { to: "/", label: t("nav.home"), Icon: HomeIcon, ActiveIcon: HomeIconSolid, end: true },
    { to: "/oglasi-za-posao", label: t("nav.jobPosts"), Icon: NewspaperIcon, ActiveIcon: NewspaperIconSolid },
    {
      to: "/messages",
      label: t("header.messages"),
      Icon: ChatBubbleLeftRightIcon,
      ActiveIcon: ChatBubbleLeftRightIconSolid,
      badge: unreadChatCount,
    },
    { to: "/profile", label: t("nav.profile"), Icon: UserIcon, ActiveIcon: UserIconSolid },
    {
      to: "/billing/upgrade",
      label: t("nav.billing"),
      Icon: CreditCardIcon,
      ActiveIcon: CreditCardIconSolid,
    },
  ];

  return (
    <aside className={styles.sidebar} aria-label={t("employerShell.sidebarNavigation")}>
      <NavLink to="/" className={styles.logoLink}>
        <img src={logo} alt="UletiSmenu" className={styles.logo} />
      </NavLink>

      <nav className={styles.nav}>
        {navItems.map(({ to, label, Icon, ActiveIcon, end, badge }) => (
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
                <span>{label}</span>
                {badge ? <span className={styles.badge}>{badge > 99 ? "99+" : badge}</span> : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button type="button" className={styles.logoutButton} onClick={onLogout}>
        <ArrowRightOnRectangleIcon className={styles.navIcon} />
        <span>{t("header.logout")}</span>
      </button>
    </aside>
  );
};

export default EmployerSidebar;
