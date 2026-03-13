import { ChangeEvent } from "react";
import styles from "./Profile.module.scss";

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
                Select photo
            </label>
            <p className={styles.fileStatusText}>
                {selectedFile ? `Selected: ${selectedFile.name}` : "No photo selected"}
            </p>
            <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={isUploading || !selectedFile}
                onClick={onUpload}
            >
                {isUploading ? "Uploading..." : "Upload photo"}
            </button>
        </div>
    );
};

export default ProfilePhotoUpload;
