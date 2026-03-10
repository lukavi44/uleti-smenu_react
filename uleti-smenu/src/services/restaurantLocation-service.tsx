import { AxiosResponse } from "axios";
import { RestaurantLocation } from "../models/RestaurantLocation.model";
import axiosInstance from "./axiosConfig";

export const GetMyRestaurantLocations = async (): Promise<AxiosResponse<RestaurantLocation[]>> => {
    return axiosInstance.get<RestaurantLocation[]>("/api/v1/User/me/locations");
};
