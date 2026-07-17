import { FormEvent, useContext, useState } from "react";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  GlobeAltIcon,
  KeyIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ShellPageHeader from "../../components/Layout/ShellPageHeader";
import { ChangePasswordRequest } from "../../services/auth-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./SettingsPage.module.scss";

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("settings.passwordMismatch"));
      return;
    }

    if (
      newPassword.length < 10 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      toast.error(t("settings.passwordRequirements"));
      return;
    }

    setIsSavingPassword(true);
    try {
      await ChangePasswordRequest(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(t("settings.passwordChanged"));
    } catch {
      toast.error(t("settings.passwordChangeError"));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className={styles.page}>
      <ShellPageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <section className={styles.card}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIcon}><KeyIcon /></span>
          <div>
            <h2>{t("settings.changePassword")}</h2>
            <p>{t("settings.changePasswordDescription")}</p>
          </div>
        </div>

        <form className={styles.passwordForm} onSubmit={handlePasswordSubmit}>
          <label>
            <span>{t("settings.currentPassword")}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </label>
          <label>
            <span>{t("settings.newPassword")}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </label>
          <label>
            <span>{t("settings.confirmPassword")}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>
          <p className={styles.formHint}>{t("settings.passwordRequirements")}</p>
          <button type="submit" className={styles.primaryButton} disabled={isSavingPassword}>
            {isSavingPassword ? t("settings.saving") : t("settings.savePassword")}
          </button>
        </form>
      </section>

      <section className={styles.card}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.sectionIcon}><GlobeAltIcon /></span>
            <div>
              <h2>{t("settings.language")}</h2>
              <p>{t("settings.languageDescription")}</p>
            </div>
          </div>
          <select
            className={styles.languageSelect}
            value={i18n.language.startsWith("sr") ? "sr" : "en"}
            aria-label={t("settings.language")}
            onChange={(event) => void i18n.changeLanguage(event.target.value)}
          >
            <option value="sr">Srpski</option>
            <option value="en">English</option>
          </select>
        </div>
      </section>

      <section className={`${styles.card} ${styles.comingSoonCard}`}>
        <span className={styles.comingSoonBadge}>{t("settings.comingSoon")}</span>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIcon}><BellIcon /></span>
          <div>
            <h2>{t("settings.notifications")}</h2>
            <p>{t("settings.notificationsDescription")}</p>
          </div>
        </div>
        <div className={styles.unavailableOptions} aria-disabled="true">
          <span>{t("settings.emailNotifications")}</span>
          <span>{t("settings.pushNotifications")}</span>
        </div>
      </section>

      <section className={`${styles.card} ${styles.comingSoonCard}`}>
        <span className={styles.comingSoonBadge}>{t("settings.comingSoon")}</span>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIcon}><ShieldCheckIcon /></span>
          <div>
            <h2>{t("settings.privacy")}</h2>
            <p>{t("settings.privacyDescription")}</p>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.sectionIcon}><ArrowRightOnRectangleIcon /></span>
            <div>
              <h2>{t("settings.logout")}</h2>
              <p>{t("settings.logoutDescription")}</p>
            </div>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={() => void logout()}>
            {t("settings.logout")}
          </button>
        </div>
      </section>

      <section className={`${styles.card} ${styles.dangerCard}`}>
        <span className={styles.comingSoonBadge}>{t("settings.comingSoon")}</span>
        <div className={styles.sectionHeading}>
          <span className={`${styles.sectionIcon} ${styles.dangerIcon}`}><TrashIcon /></span>
          <div>
            <h2>{t("settings.dangerZone")}</h2>
            <p>{t("settings.deleteAccountDescription")}</p>
          </div>
        </div>
        <button type="button" className={styles.dangerButton} disabled>
          {t("settings.deleteAccount")}
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
