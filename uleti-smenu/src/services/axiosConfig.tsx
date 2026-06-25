import axios from "axios";
import { toast } from "react-toastify";
import getApiBaseUrl from "../configuration/config";
import i18n from "../i18n";
import { LoginResponseData } from "./auth-service";
import { isPublicAuthPath, isPublicBrowsePath } from "../helpers/publicBrowse";

const apiBaseURL = getApiBaseUrl();

const axiosInstance = axios.create({
    baseURL: apiBaseURL,
    headers: {
        // "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const isAuthEndpoint = (url?: string) => {
    if (!url) return false;
    return /\/(login|refresh|register)(\/|$|\?)/.test(url);
};

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("AccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const handleSessionExpired = (hadSession: boolean) => {
      localStorage.removeItem("AccessToken");
      localStorage.removeItem("RefreshToken");

      if (!hadSession) {
        return;
      }

      toast.error(i18n.t("common.sessionExpired"));
      const path = window.location.pathname;
      if (!isPublicAuthPath(path) && !isPublicBrowsePath(path)) {
        window.location.href = "/login";
      }
    };

    if (error.response?.status === 401 && isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const hadAccessToken = Boolean(localStorage.getItem("AccessToken"));
      const hadRefreshToken = Boolean(localStorage.getItem("RefreshToken"));
      const hadSession = hadAccessToken || hadRefreshToken;

      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("RefreshToken");
        if (refreshToken) {
          const { data } = await axios.post<LoginResponseData>(
            `${apiBaseURL}/refresh`,
            { refreshToken },
            { headers: { Accept: "application/json", "Content-Type": "application/json" } }
          );

          localStorage.setItem("AccessToken", data.accessToken);
          localStorage.setItem("RefreshToken", data.refreshToken);

          originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;

          return axiosInstance(originalRequest);
        }
      } catch {
        handleSessionExpired(hadSession);
        return Promise.reject(error);
      }

      handleSessionExpired(hadSession);
    } else if (error.response?.status === 401) {
      const hadSession =
        Boolean(localStorage.getItem("AccessToken")) || Boolean(localStorage.getItem("RefreshToken"));
      if (hadSession) {
        handleSessionExpired(true);
      }
    } else if (error.response?.status === 500) {
      toast.error(i18n.t("common.unexpectedServerError"));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
