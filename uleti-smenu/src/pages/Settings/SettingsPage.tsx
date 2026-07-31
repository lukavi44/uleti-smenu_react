import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
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
import {
  getNotificationPreferences,
  NotificationPreferences,
  updateNotificationPreferences,
} from "../../services/notification-preferences-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./SettingsPage.module.scss";

type PreferenceKey = keyof NotificationPreferences;

interface PreferenceToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const PreferenceToggle = ({
  id,
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: PreferenceToggleProps) => (
  <div className={styles.preferenceRow}>
    <div className={styles.preferenceInfo}>
      <label htmlFor={id} className={styles.preferenceLabel}>
        {label}
      </label>
      <p className={styles.preferenceDescription}>{description}</p>
    </div>
    <label className={styles.toggle} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className={styles.toggleInput}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.toggleTrack} aria-hidden="true" />
    </label>
  </div>
);

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { logout, role } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isSavingPreference, setIsSavingPreference] = useState(false);

  const isEmployee = role === "Employee";
  const isEmployer = role === "Employer";

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      setIsLoadingPreferences(true);
      try {
        const data = await getNotificationPreferences();
        if (isMounted) {
          setPreferences(data);
        }
      } catch {
        if (isMounted) {
          toast.error(t("settings.notificationsLoadError"));
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreferences(false);
        }
      }
    };

    void loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const handlePreferenceChange = useCallback(
    async (key: PreferenceKey, checked: boolean) => {
      if (!preferences) {
        return;
      }

      const previous = preferences;
      const next = { ...preferences, [key]: checked };
      setPreferences(next);
      setIsSavingPreference(true);

      try {
        const saved = await updateNotificationPreferences({ [key]: checked });
        setPreferences(saved);
        toast.success(t("settings.notificationsSaved"));
      } catch {
        setPreferences(previous);
        toast.error(t("settings.notificationsSaveError"));
      } finally {
        setIsSavingPreference(false);
      }
    },
    [preferences, t],
  );

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

      <section className={styles.card}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIcon}><BellIcon /></span>
          <div>
            <h2>{t("settings.notifications")}</h2>
            <p>
              {isEmployer
                ? t("settings.employerNotificationsDescription")
                : t("settings.notificationsDescription")}
            </p>
          </div>
        </div>

        {isLoadingPreferences || !preferences ? (
          <p className={styles.preferenceStatus}>{t("common.loading")}</p>
        ) : (
          <div className={styles.preferencesPanel}>
            {(isEmployee || isEmployer) && (
              <div className={styles.preferenceGroup}>
                <h3>{t("settings.notificationsEmailSection")}</h3>
                {isEmployee && (
                  <PreferenceToggle
                    id="notify-email-favourite-job"
                    label={t("settings.notifyEmailFavouriteJobPost")}
                    description={t("settings.notifyEmailFavouriteJobPostDescription")}
                    checked={preferences.emailFavouriteJobPost}
                    disabled={isSavingPreference}
                    onChange={(checked) => void handlePreferenceChange("emailFavouriteJobPost", checked)}
                  />
                )}
                {isEmployer && (
                  <PreferenceToggle
                    id="notify-email-application-received"
                    label={t("settings.notifyEmailApplicationReceived")}
                    description={t("settings.notifyEmailApplicationReceivedDescription")}
                    checked={preferences.emailApplicationReceived}
                    disabled={isSavingPreference}
                    onChange={(checked) => void handlePreferenceChange("emailApplicationReceived", checked)}
                  />
                )}
              </div>
            )}

            <div className={styles.preferenceGroup}>
              <h3>{t("settings.notificationsInAppSection")}</h3>
              {isEmployee && (
                <>
                  <PreferenceToggle
                    id="notify-inapp-favourite-job"
                    label={t("settings.notifyInAppFavouriteJobPost")}
                    description={t("settings.notifyInAppFavouriteJobPostDescription")}
                    checked={preferences.inAppFavouriteJobPost}
                    disabled={isSavingPreference}
                    onChange={(checked) => void handlePreferenceChange("inAppFavouriteJobPost", checked)}
                  />
                  <PreferenceToggle
                    id="notify-inapp-application-accepted"
                    label={t("settings.notifyInAppApplicationAccepted")}
                    description={t("settings.notifyInAppApplicationAcceptedDescription")}
                    checked={preferences.inAppApplicationAccepted}
                    disabled={isSavingPreference}
                    onChange={(checked) => void handlePreferenceChange("inAppApplicationAccepted", checked)}
                  />
                  <PreferenceToggle
                    id="notify-inapp-application-declined"
                    label={t("settings.notifyInAppApplicationDeclined")}
                    description={t("settings.notifyInAppApplicationDeclinedDescription")}
                    checked={preferences.inAppApplicationDeclined}
                    disabled={isSavingPreference}
                    onChange={(checked) => void handlePreferenceChange("inAppApplicationDeclined", checked)}
                  />
                </>
              )}
              {isEmployer && (
                <PreferenceToggle
                  id="notify-inapp-application-received"
                  label={t("settings.notifyInAppApplicationReceived")}
                  description={t("settings.notifyInAppApplicationReceivedDescription")}
                  checked={preferences.inAppApplicationReceived}
                  disabled={isSavingPreference}
                  onChange={(checked) => void handlePreferenceChange("inAppApplicationReceived", checked)}
                />
              )}
              <PreferenceToggle
                id="notify-inapp-review-reminder"
                label={t("settings.notifyInAppReviewReminder")}
                description={
                  isEmployer
                    ? t("settings.notifyInAppReviewReminderEmployerDescription")
                    : t("settings.notifyInAppReviewReminderDescription")
                }
                checked={preferences.inAppReviewReminder}
                disabled={isSavingPreference}
                onChange={(checked) => void handlePreferenceChange("inAppReviewReminder", checked)}
              />
            </div>
          </div>
        )}
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
