import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import styles from "./AdminMobileHeader.module.scss";

type AdminMobileHeaderProps = {
  title: string;
  onOpenMenu: () => void;
};

const AdminMobileHeader = ({ title, onOpenMenu }: AdminMobileHeaderProps) => {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <button type="button" className={styles.menuButton} onClick={onOpenMenu} aria-label={t("admin.shell.openMenu")}>
        <Bars3Icon className={styles.menuIcon} />
      </button>
      <h1 className={styles.title}>{title}</h1>
      <button type="button" className={styles.bellButton} aria-label={t("admin.shell.notifications")}>
        <BellIcon className={styles.bellIcon} />
      </button>
    </header>
  );
};

export default AdminMobileHeader;
