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

export const GetMyRestaurantLocations = async (): Promise<AxiosResponse<RestaurantLocation[]>> => {
    return axiosInstance.get<RestaurantLocation[]>("/api/v1/User/me/locations");
};

export const CreateMyRestaurantLocation = async (
    payload: CreateRestaurantLocationRequest
): Promise<AxiosResponse<RestaurantLocation>> => {
    return axiosInstance.post<RestaurantLocation>("/api/v1/User/me/locations", payload);
};
