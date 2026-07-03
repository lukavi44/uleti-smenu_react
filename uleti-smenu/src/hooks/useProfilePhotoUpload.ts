import { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getImageUrl } from "../helpers/getHelperUrl";
import { UpdateMyProfilePhoto, getCurrentUser } from "../services/user-service";
import { AuthContext } from "../store/Auth-context";

export const useProfilePhotoUpload = (initialPhoto?: string, userId?: string) => {
  const { t } = useTranslation();
  const { refreshMe } = useContext(AuthContext);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(getImageUrl(initialPhoto));
  const [isPhotoUploadInProgress, setIsPhotoUploadInProgress] = useState(false);

  useEffect(() => {
    setProfilePhotoUrl(getImageUrl(initialPhoto));
  }, [initialPhoto]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const syncProfilePhoto = async () => {
      try {
        const response = await getCurrentUser();
        const photo = "profilePhoto" in response.data ? response.data.profilePhoto : undefined;
        setProfilePhotoUrl(getImageUrl(photo));
      } catch {
        setProfilePhotoUrl(getImageUrl(initialPhoto));
      }
    };

    void syncProfilePhoto();
  }, [initialPhoto, userId]);

  const uploadPhoto = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }

      setIsPhotoUploadInProgress(true);
      try {
        const response = await UpdateMyProfilePhoto(file);
        setProfilePhotoUrl(getImageUrl(response.data.imagePath));
        toast.success(t("profile.photoUpdated"));
        void refreshMe();
      } catch {
        toast.error(t("profile.photoUpdateError"));
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
