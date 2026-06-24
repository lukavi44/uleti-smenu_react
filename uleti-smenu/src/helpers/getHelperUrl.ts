import defaultImg from '../assets/restoran1.jpg';
import getApiBaseUrl from '../configuration/config';

export const getImageUrl = (relativePath?: string | null): string => {
    if (!relativePath || relativePath.trim() === "") {
      return defaultImg;
    }

    const trimmedPath = relativePath.trim();
    if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
      return trimmedPath;
    }

    const normalizedPath = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
    return `${getApiBaseUrl()}${normalizedPath}`;
  };
  
