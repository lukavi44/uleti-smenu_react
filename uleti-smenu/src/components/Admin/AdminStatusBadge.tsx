import { useTranslation } from "react-i18next";
import styles from "./AdminStatusBadge.module.scss";

type AdminStatusBadgeProps = {
  kind: "active" | "suspended" | "verified" | "notVerified";
};

const AdminStatusBadge = ({ kind }: AdminStatusBadgeProps) => {
  const { t } = useTranslation();

  const labels = {
    active: t("admin.status.active"),
    suspended: t("admin.status.suspended"),
    verified: t("admin.verification.verifiedBadge"),
    notVerified: t("admin.verification.notVerified"),
  };

  return <span className={`${styles.badge} ${styles[kind]}`}>{labels[kind]}</span>;
};

export default AdminStatusBadge;
