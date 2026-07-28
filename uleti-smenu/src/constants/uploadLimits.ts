export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_PHOTO_MAX_MB = 5;

export const PROFILE_PHOTO_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

const ALLOWED_PROFILE_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_PROFILE_PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export function isAllowedProfilePhotoFile(file: File): boolean {
  if (ALLOWED_PROFILE_PHOTO_TYPES.has(file.type)) {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return ALLOWED_PROFILE_PHOTO_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}
