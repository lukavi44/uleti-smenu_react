import defaultImg from '../assets/restoran1.jpg';
import getApiBaseUrl from '../configuration/config';

export const getImageUrl = (relativePath?: string | null): string => {
    if (!relativePath || relativePath.trim() === "") {
      return defaultImg;
    }
    return `${getApiBaseUrl()}${relativePath}`;
  };
  
