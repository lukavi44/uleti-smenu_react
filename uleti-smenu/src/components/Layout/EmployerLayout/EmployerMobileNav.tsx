import { NavLink } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  HomeIcon,
  NewspaperIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  HomeIcon as HomeIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import styles from "./EmployerMobileNav.module.scss";

type EmployerMobileNavProps = {
  unreadChatCount: number;
};

const EmployerMobileNav = ({ unreadChatCount }: EmployerMobileNavProps) => {
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
  ];

  return (
    <nav className={styles.bottomNav} aria-label={t("nav.quickNavigation")}>
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
            <span className={styles.navItemInner}>
              {isActive ? <ActiveIcon className={styles.navIcon} /> : <Icon className={styles.navIcon} />}
              <span className={styles.navLabel}>{label}</span>
              {badge ? <span className={styles.badge}>{badge > 9 ? "9+" : badge}</span> : null}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default EmployerMobileNav;
