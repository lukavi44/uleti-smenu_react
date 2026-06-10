import { AxiosResponse } from "axios";
import axiosInstance from "./axiosConfig"
import { Employer } from "../models/User.model";

export const GetAllEmployers = async (city?: string): Promise<AxiosResponse<Employer[]>> => {
    return axiosInstance.get<Employer[]>("/api/v1/User/role/employer", {
        params: city ? { city } : undefined,
    });
};

export const GetEmployersWithFavouriteStatus = async (city?: string): Promise<AxiosResponse<Employer[]>> => {
    return axiosInstance.get<Employer[]>("/api/v1/User/employers/", {
        params: city ? { city } : undefined,
    });
};

export const GetEmployerCities = async (): Promise<AxiosResponse<string[]>> => {
    return axiosInstance.get<string[]>("/api/v1/User/employers/cities");
};

export const GetCurrentUserRole = async (): Promise<AxiosResponse<string>> => {
    return axiosInstance.get<string>("/api/v1/User/me/role");
}

export const getCurrentUser = async () => {
    return await axiosInstance.get("/api/v1/User/me");
};

export const UpdateMyProfilePhoto = async (file: File): Promise<AxiosResponse<{ imagePath: string }>> => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance.patch<{ imagePath: string }>("/api/v1/User/me/profile-photo", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const PatchClientFavorite = async (
    employerId: string
  ): Promise<AxiosResponse<Employer>> => {
    return axiosInstance.post(`/api/v1/User/favourite/${employerId}`);
  };