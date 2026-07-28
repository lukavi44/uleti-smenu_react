import getApiBaseUrl from '../configuration/config';

const buildImageUrl = (relativePath: string): string => {
    const trimmedPath = relativePath.trim();
    if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
      return trimmedPath;
    }

    const normalizedPath = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
    return `${getApiBaseUrl()}${normalizedPath}`;
};

export const getOptionalImageUrl = (relativePath?: string | null): string | undefined => {
    if (!relativePath || relativePath.trim() === "") {
      return undefined;
    }

    return buildImageUrl(relativePath);
};

/** @deprecated Prefer UserAvatar or ImageWithFallback for missing/invalid images. */
export const getImageUrl = (relativePath?: string | null): string =>
  getOptionalImageUrl(relativePath) ?? "";
  
