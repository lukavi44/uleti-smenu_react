import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  CreditCardIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../store/Auth-context";
import { Employer } from "../../../models/User.model";
import { getImageUrl } from "../../../helpers/getHelperUrl";
import styles from "./EmployerProfileMenu.module.scss";

const EmployerProfileMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { me, logout } = useContext(AuthContext);
  const employer = me && "name" in me ? (me as Employer) : null;
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef} data-employer-profile-menu>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ""}`}
        aria-label={t("nav.profile")}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <img src={getImageUrl(employer?.profilePhoto)} alt="" className={styles.avatar} />
      </button>

      {isOpen ? (
        <div className={styles.panel}>
          <button type="button" className={styles.menuItem} onClick={() => handleNavigate("/profile")}>
            <UserIcon className={styles.menuIcon} aria-hidden />
            <span>{t("nav.profile")}</span>
            <ChevronRightIcon className={styles.menuChevron} aria-hidden />
          </button>

          <button
            type="button"
            className={styles.menuItem}
            onClick={() => handleNavigate("/billing/upgrade")}
          >
            <CreditCardIcon className={styles.menuIcon} aria-hidden />
            <span>{t("nav.billing")}</span>
            <ChevronRightIcon className={styles.menuChevron} aria-hidden />
          </button>

          <button type="button" className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => void handleLogout()}>
            <ArrowRightOnRectangleIcon className={styles.menuIcon} aria-hidden />
            <span>{t("header.logOut")}</span>
            <ChevronRightIcon className={styles.menuChevron} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default EmployerProfileMenu;
