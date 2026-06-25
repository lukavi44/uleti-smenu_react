import defaultImg from '../assets/restoran1.jpg';
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

export const getImageUrl = (relativePath?: string | null): string => {
    if (!relativePath || relativePath.trim() === "") {
      return defaultImg;
    }

    return buildImageUrl(relativePath);
  };
  
