import { AxiosResponse } from "axios";
import axiosInstance from "./axiosConfig"
import { Employer } from "../models/User.model";

export const GetAllEmployers = async(): Promise<AxiosResponse<Employer[]>> => {
    return axiosInstance.get<Employer[]>("/api/v1/User/role/employer");
}