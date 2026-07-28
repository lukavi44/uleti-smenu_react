import axios from "axios";
import { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { PROFILE_PHOTO_MAX_MB } from "../constants/uploadLimits";
import { getOptionalImageUrl } from "../helpers/getHelperUrl";
import { validateProfilePhotoFile } from "../helpers/profilePhotoUploadValidation";
import { UpdateMyProfilePhoto, getCurrentUser } from "../services/user-service";
import { AuthContext } from "../store/Auth-context";

export const useProfilePhotoUpload = (initialPhoto?: string, userId?: string) => {
  const { t } = useTranslation();
  const { refreshMe } = useContext(AuthContext);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(
    getOptionalImageUrl(initialPhoto) ?? null
  );
  const [isPhotoUploadInProgress, setIsPhotoUploadInProgress] = useState(false);

  useEffect(() => {
    setProfilePhotoUrl(getOptionalImageUrl(initialPhoto) ?? null);
  }, [initialPhoto]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const syncProfilePhoto = async () => {
      try {
        const response = await getCurrentUser();
        const photo = "profilePhoto" in response.data ? response.data.profilePhoto : undefined;
        setProfilePhotoUrl(getOptionalImageUrl(photo) ?? null);
      } catch {
        setProfilePhotoUrl(getOptionalImageUrl(initialPhoto) ?? null);
      }
    };

    void syncProfilePhoto();
  }, [initialPhoto, userId]);

  const uploadPhoto = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }

      const validationError = validateProfilePhotoFile(file);
      if (validationError === "tooLarge") {
        toast.error(t("profile.photoTooLarge", { maxMb: PROFILE_PHOTO_MAX_MB }));
        return;
      }
      if (validationError === "invalidType") {
        toast.error(t("profile.photoInvalidType"));
        return;
      }

      setIsPhotoUploadInProgress(true);
      try {
        const response = await UpdateMyProfilePhoto(file);
        setProfilePhotoUrl(getOptionalImageUrl(response.data.imagePath) ?? null);
        toast.success(t("profile.photoUpdated"));
        void refreshMe();
      } catch (error: unknown) {
        let message = t("profile.photoUpdateError");
        if (axios.isAxiosError(error)) {
          const data = error.response?.data;
          if (typeof data === "string" && data.trim()) {
            message = data;
          } else if (data && typeof data === "object") {
            const payload = data as { message?: string; Message?: string };
            message = payload.message ?? payload.Message ?? message;
          }
        }
        toast.error(message);
      } finally {
        setIsPhotoUploadInProgress(false);
      }
    },
    [refreshMe, t]
  );

  const handlePhotoSelect = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      event.target.value = "";
      await uploadPhoto(file);
    },
    [uploadPhoto]
  );

  return {
    profilePhotoUrl,
    setProfilePhotoUrl,
    isPhotoUploadInProgress,
    photoInputRef,
    handlePhotoSelect,
  };
};
