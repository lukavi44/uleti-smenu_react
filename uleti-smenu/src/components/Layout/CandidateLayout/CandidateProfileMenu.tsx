import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../store/Auth-context";
import { Employee } from "../../../models/User.model";
import { getImageUrl } from "../../../helpers/getHelperUrl";
import styles from "./CandidateProfileMenu.module.scss";

const CandidateProfileMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { me, logout } = useContext(AuthContext);
  const employee = me && "firstName" in me ? (me as Employee) : null;
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
    <div className={styles.wrapper} ref={wrapperRef} data-candidate-profile-menu>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ""}`}
        aria-label={t("nav.profile")}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <img src={getImageUrl(employee?.profilePhoto)} alt="" className={styles.avatar} />
      </button>

      {isOpen ? (
        <div className={styles.panel}>
          <button type="button" className={styles.menuItem} onClick={() => handleNavigate("/profile")}>
            <UserIcon className={styles.menuIcon} aria-hidden />
            <span>{t("nav.profile")}</span>
            <ChevronRightIcon className={styles.menuChevron} aria-hidden />
          </button>

          <button type="button" className={styles.menuItem} onClick={() => handleNavigate("/moje-smene")}>
            <CalendarDaysIcon className={styles.menuIcon} aria-hidden />
            <span>{t("nav.myShifts")}</span>
            <ChevronRightIcon className={styles.menuChevron} aria-hidden />
          </button>

          <button
            type="button"
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            onClick={() => void handleLogout()}
          >
            <ArrowRightOnRectangleIcon className={styles.menuIcon} aria-hidden />
            <span>{t("header.logOut")}</span>
            <ChevronRightIcon className={styles.menuChevron} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default CandidateProfileMenu;
