import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  GlobeAltIcon,
  HomeIcon,
  InformationCircleIcon,
  NewspaperIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  HomeIcon as HomeIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../store/Auth-context";
import { useContext } from "react";
import styles from "./EmployerMobileNav.module.scss";

type EmployerMobileNavProps = {
  unreadChatCount: number;
};

const EmployerMobileNav = ({ unreadChatCount }: EmployerMobileNavProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    void logout();
  };

  return (
    <>
      {isMenuOpen ? (
        <>
          <button
            type="button"
            className={styles.drawerBackdrop}
            aria-label={t("candidateMenu.close")}
            onClick={() => setIsMenuOpen(false)}
          />
          <section
            id="employer-mobile-menu"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="employer-mobile-menu-title"
          >
            <div className={styles.drawerHandle} aria-hidden />
            <div className={styles.drawerHeader}>
              <h2 id="employer-mobile-menu-title">{t("header.menu")}</h2>
              <button
                type="button"
                className={styles.closeButton}
                aria-label={t("candidateMenu.close")}
                onClick={() => setIsMenuOpen(false)}
              >
                <XMarkIcon />
              </button>
            </div>

            <div className={styles.drawerItems}>
              <button type="button" className={styles.drawerItem} onClick={() => handleNavigate("/restaurants")}>
                <BuildingStorefrontIcon />
                <span>{t("header.restaurants")}</span>
              </button>
              <button type="button" className={styles.drawerItem} onClick={() => handleNavigate("/billing/upgrade")}>
                <CreditCardIcon />
                <span>{t("nav.billing")}</span>
              </button>
              <button type="button" className={styles.drawerItem} onClick={() => handleNavigate("/settings")}>
                <Cog6ToothIcon />
                <span>{t("nav.settings")}</span>
              </button>
              <div className={`${styles.drawerItem} ${styles.languageItem}`}>
                <span className={styles.languageLabel}>
                  <GlobeAltIcon />
                  <span>{t("candidateMenu.language")}</span>
                </span>
                <select
                  value={i18n.language.startsWith("sr") ? "sr" : "en"}
                  aria-label={t("candidateMenu.language")}
                  onChange={(event) => void i18n.changeLanguage(event.target.value)}
                >
                  <option value="sr">SR</option>
                  <option value="en">EN</option>
                </select>
              </div>
              <button type="button" className={styles.drawerItem} onClick={() => handleNavigate("/faq")}>
                <QuestionMarkCircleIcon />
                <span>{t("candidateMenu.help")}</span>
              </button>
              <button type="button" className={styles.drawerItem} onClick={() => handleNavigate("/how-it-works")}>
                <InformationCircleIcon />
                <span>{t("candidateMenu.howItWorks")}</span>
              </button>
              <button
                type="button"
                className={`${styles.drawerItem} ${styles.drawerItemDanger}`}
                onClick={handleLogout}
              >
                <ArrowRightOnRectangleIcon />
                <span>{t("header.logout")}</span>
              </button>
            </div>
          </section>
        </>
      ) : null}

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
        <button
          type="button"
          className={`${styles.navItem} ${styles.menuButton} ${isMenuOpen ? styles.navItemActive : ""}`}
          aria-expanded={isMenuOpen}
          aria-controls="employer-mobile-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className={styles.navItemInner}>
            <Bars3Icon className={styles.navIcon} />
            <span className={styles.navLabel}>{t("header.menu")}</span>
          </span>
        </button>
      </nav>
    </>
  );
};

export default EmployerMobileNav;
