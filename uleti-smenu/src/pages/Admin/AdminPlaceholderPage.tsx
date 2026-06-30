import { useTranslation } from "react-i18next";
import styles from "./AdminPlaceholderPage.module.scss";

type AdminPlaceholderPageProps = {
  titleKey: string;
};

const AdminPlaceholderPage = ({ titleKey }: AdminPlaceholderPageProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <p className={styles.message}>{t("admin.placeholder.comingSoon", { section: t(titleKey) })}</p>
    </div>
  );
};

export default AdminPlaceholderPage;
