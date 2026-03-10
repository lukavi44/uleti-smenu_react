import axios from "axios";
import { toast } from "react-toastify";
import getApiBaseUrl from "../configuration/config";

const apiBaseURL = getApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: {
    // "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("AccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const errorMessage = error.response?.data as unknown as string;
    const originalRequest = error.config;

    const handleSessionExpired = () => {
      localStorage.removeItem("AccessToken");
      localStorage.removeItem("RefreshToken");
      toast.error("Session expired, please login again.");
      window.location.href = "/login";
    };

    if (error.response.status === 401 && !originalRequest._retry && errorMessage !== "Invalid refresh token.") {
      originalRequest._retry = true;
      try {
        const _accessToken = localStorage.getItem("AccessToken");
        const _refreshToken = localStorage.getItem("RefreshToken");

        if (_accessToken && _refreshToken) {
          const body = {
            accessToken: _accessToken,
            refreshToken: _refreshToken
          };
        //   const { data } = await RefreshToken(body);

          localStorage.setItem('AccessToken', body.accessToken);
          localStorage.setItem('RefreshToken', body.refreshToken)

          originalRequest.headers['Authorization'] = `Bearer ${body.accessToken}`;

          return axiosInstance(originalRequest);
        }
      } catch (err) {
        return Promise.reject(err)
      }
    } else if (error.response.status === 401 && errorMessage === "Invalid refresh token.") {
      handleSessionExpired();
    } else if (error.response.status === 500) {
      toast.error("Unexpected server error");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
