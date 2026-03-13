import { ChangeEvent } from "react";
import styles from "./Profile.module.scss";
import { useTranslation } from "react-i18next";

interface ProfilePhotoUploadProps {
    inputId: string;
    selectedFile: File | null;
    isUploading: boolean;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onUpload: () => void;
}

const ProfilePhotoUpload = ({
    inputId,
    selectedFile,
    isUploading,
    onFileChange,
    onUpload
}: ProfilePhotoUploadProps) => {
    const { t } = useTranslation();
    return (
        <div className={styles.profileActions}>
            <input
                id={inputId}
                className={styles.fileInputHidden}
                type="file"
                accept="image/*"
                onChange={onFileChange}
            />
            <label htmlFor={inputId} className={`${styles.button} ${styles.buttonSecondary} ${styles.filePickerButton}`}>
                {t("profile.selectPhoto")}
            </label>
            <p className={styles.fileStatusText}>
                {selectedFile ? `${t("profile.selectedPhoto")}: ${selectedFile.name}` : t("profile.noPhotoSelected")}
            </p>
            <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={isUploading || !selectedFile}
                onClick={onUpload}
            >
                {isUploading ? t("profile.uploading") : t("profile.uploadPhoto")}
            </button>
        </div>
    );
};

export default ProfilePhotoUpload;
