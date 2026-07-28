import { ChangeEvent, RefObject } from "react";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PROFILE_PHOTO_ACCEPT, PROFILE_PHOTO_MAX_MB } from "../../constants/uploadLimits";
import styles from "./ProfileAvatarPicker.module.scss";

interface ProfileAvatarPickerProps {
  photoUrl: string | null;
  fallbackLabel: string;
  isUploading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onPhotoError?: () => void;
  variant: "desktop" | "mobile";
  imageClassName: string;
  fallbackClassName: string;
}

const ProfileAvatarPicker = ({
  photoUrl,
  fallbackLabel,
  isUploading,
  inputRef,
  onSelect,
  onPhotoError,
  variant,
  imageClassName,
  fallbackClassName,
}: ProfileAvatarPickerProps) => {
  const { t } = useTranslation();
  const initials = fallbackLabel.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <div className={styles.field}>
      <div className={styles.wrap}>
        <button
          type="button"
          className={styles.button}
          aria-label={t("profile.selectPhoto")}
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className={imageClassName} onError={onPhotoError} />
          ) : (
            <span className={`${imageClassName} ${fallbackClassName}`}>{initials}</span>
          )}
          {isUploading ? (
            <span className={styles.loadingOverlay} aria-hidden="true">
              <span className={styles.spinner} />
            </span>
          ) : variant === "desktop" ? (
            <span className={styles.hoverOverlay} aria-hidden="true">
              <CameraIcon width={28} height={28} />
            </span>
          ) : (
            <span className={styles.mobileBadge} aria-hidden="true">
              <CameraIcon width={14} height={14} />
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          type="file"
          accept={PROFILE_PHOTO_ACCEPT}
          onChange={onSelect}
        />
      </div>
      <p className={styles.hint}>{t("profile.photoUploadHint", { maxMb: PROFILE_PHOTO_MAX_MB })}</p>
    </div>
  );
};

export default ProfileAvatarPicker;
