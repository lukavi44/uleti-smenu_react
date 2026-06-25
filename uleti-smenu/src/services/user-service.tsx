import { AxiosResponse } from "axios";
import axiosInstance from "./axiosConfig"
import { Employee, Employer } from "../models/User.model";

export interface UpdateEmployeeProfilePayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city?: string;
}

const normalizeEmployee = (data: Record<string, unknown>): Employee => ({
  id: String(data.id ?? data.Id ?? ""),
  email: String(data.email ?? data.Email ?? ""),
  password: "",
  phoneNumber: String(data.phoneNumber ?? data.PhoneNumber ?? ""),
  firstName: String(data.firstName ?? data.FirstName ?? ""),
  lastName: String(data.lastName ?? data.LastName ?? ""),
  profilePhoto: (data.profilePhoto ?? data.ProfilePhoto) as string | undefined,
  city: String(data.city ?? data.City ?? "").trim() || undefined,
  address: {
    street: { name: "", number: 0 },
    city: {
      name: String(data.city ?? data.City ?? ""),
      postalCode: 0,
      country: "",
      region: "",
    },
  },
});

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
    const response = await axiosInstance.get("/api/v1/User/me");
    const data = response.data as Record<string, unknown>;
    const roleResponse = await GetCurrentUserRole().catch(() => null);
    const role = roleResponse?.data;

    if (role === "Employee") {
      return {
        ...response,
        data: normalizeEmployee(data),
      };
    }

    return response;
};

export const UpdateMyEmployeeProfile = async (
  payload: UpdateEmployeeProfilePayload
): Promise<AxiosResponse<Employee>> => {
  const response = await axiosInstance.patch("/api/v1/User/me/profile", payload);
  return {
    ...response,
    data: normalizeEmployee(response.data as Record<string, unknown>),
  };
};

export const UpdateMyProfilePhoto = async (file: File): Promise<AxiosResponse<{ imagePath: string }>> => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance.patch<{ imagePath: string }>("/api/v1/User/me/profile-photo", formData);
};

export const PatchClientFavorite = async (
    employerId: string
  ): Promise<AxiosResponse<Employer>> => {
    return axiosInstance.post(`/api/v1/User/favourite/${employerId}`);
  };