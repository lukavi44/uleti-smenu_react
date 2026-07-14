import { AxiosResponse } from "axios";
import axiosInstance from "./axiosConfig"
import { Employee, Employer } from "../models/User.model";
import { EmployerSubscription } from "../models/Subscription.model";

export interface UpdateEmployeeProfilePayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city?: string;
}

export interface UpdateEmployerProfilePayload {
  name: string;
  phoneNumber: string;
  pib: string;
  mb: string;
  streetName: string;
  streetNumber: string;
  postalCode: string;
  countryCode: string;
  regionCode: string;
  cityCode: string;
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

const normalizeEmployer = (data: Record<string, unknown>): Employer => {
  const addressRaw = (data.address ?? data.Address) as Record<string, unknown> | undefined;
  const streetNumberRaw = addressRaw?.streetNumber ?? addressRaw?.StreetNumber ?? "";
  const postalCodeRaw = addressRaw?.postalCode ?? addressRaw?.PostalCode ?? "";

  return {
    id: String(data.id ?? data.Id ?? ""),
    email: String(data.email ?? data.Email ?? ""),
    password: "",
    phoneNumber: String(data.phoneNumber ?? data.PhoneNumber ?? ""),
    name: String(data.name ?? data.Name ?? ""),
    pib: String(data.pib ?? data.PIB ?? ""),
    mb: String(data.mb ?? data.MB ?? ""),
    profilePhoto: (data.profilePhoto ?? data.ProfilePhoto) as string | undefined,
    isFavourite: Boolean(data.isFavourite ?? data.IsFavourite ?? false),
    publicSlug: (data.publicSlug ?? data.PublicSlug) as string | undefined,
    subscription: (data.subscription ?? data.Subscription) as EmployerSubscription | undefined,
    countryCode: String(data.countryCode ?? data.CountryCode ?? ""),
    regionCode: String(data.regionCode ?? data.RegionCode ?? ""),
    cityCode: String(data.cityCode ?? data.CityCode ?? ""),
    address: {
      street: {
        name: String(addressRaw?.street ?? addressRaw?.Street ?? ""),
        number: Number.parseInt(String(streetNumberRaw), 10) || 0,
      },
      city: {
        name: String(addressRaw?.city ?? addressRaw?.City ?? ""),
        postalCode: Number.parseInt(String(postalCodeRaw), 10) || 0,
        country: String(addressRaw?.country ?? addressRaw?.Country ?? ""),
        region: String(addressRaw?.region ?? addressRaw?.Region ?? ""),
      },
    },
  };
};

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

    if (role === "Employer") {
      return {
        ...response,
        data: normalizeEmployer(data),
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

export const UpdateMyEmployerProfile = async (
  payload: UpdateEmployerProfilePayload
): Promise<AxiosResponse<Employer>> => {
  const response = await axiosInstance.patch("/api/v1/User/me/employer-profile", payload);
  return {
    ...response,
    data: normalizeEmployer(response.data as Record<string, unknown>),
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