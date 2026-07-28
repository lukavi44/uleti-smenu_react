import {
  isAllowedProfilePhotoFile,
  PROFILE_PHOTO_MAX_BYTES,
} from "../constants/uploadLimits";

export type ProfilePhotoValidationError = "tooLarge" | "invalidType";

export function validateProfilePhotoFile(file: File): ProfilePhotoValidationError | null {
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return "tooLarge";
  }

  if (!isAllowedProfilePhotoFile(file)) {
    return "invalidType";
  }

  return null;
}
