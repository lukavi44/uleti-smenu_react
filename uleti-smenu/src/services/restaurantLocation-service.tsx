import { AxiosResponse } from "axios";
import { RestaurantLocation } from "../models/RestaurantLocation.model";
import axiosInstance from "./axiosConfig";

export interface CreateRestaurantLocationRequest {
    name: string;
    phoneNumber: string;
    pib: string;
    mb: string;
    streetName: string;
    streetNumber: string;
    city: string;
    postalCode: string;
    country: string;
    region: string;
}

const normalizeRestaurantLocation = (data: Record<string, unknown>): RestaurantLocation => ({
    id: String(data.id ?? data.Id ?? ""),
    employerId: String(data.employerId ?? data.EmployerId ?? ""),
    name: String(data.name ?? data.Name ?? ""),
    phoneNumber: String(data.phoneNumber ?? data.PhoneNumber ?? ""),
    pib: String(data.pib ?? data.PIB ?? ""),
    mb: String(data.mb ?? data.MB ?? ""),
    streetName: String(data.streetName ?? data.StreetName ?? ""),
    streetNumber: String(data.streetNumber ?? data.StreetNumber ?? ""),
    city: String(data.city ?? data.City ?? ""),
    postalCode: String(data.postalCode ?? data.PostalCode ?? ""),
    country: String(data.country ?? data.Country ?? ""),
    region: String(data.region ?? data.Region ?? ""),
});

export const GetMyRestaurantLocations = async (): Promise<AxiosResponse<RestaurantLocation[]>> => {
    const response = await axiosInstance.get("/api/v1/User/me/locations");
    const locations = (response.data as Record<string, unknown>[]).map(normalizeRestaurantLocation);

    return {
        ...response,
        data: locations,
    };
};

export const CreateMyRestaurantLocation = async (
    payload: CreateRestaurantLocationRequest
): Promise<AxiosResponse<RestaurantLocation>> => {
    const response = await axiosInstance.post("/api/v1/User/me/locations", payload);

    return {
        ...response,
        data: normalizeRestaurantLocation(response.data as Record<string, unknown>),
    };
};
