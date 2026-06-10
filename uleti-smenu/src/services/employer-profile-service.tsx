import { AxiosResponse } from "axios";
import { EmployerPublicProfile } from "../models/EmployerPublicProfile.model";
import axiosInstance from "./axiosConfig";

export const GetEmployerPublicProfile = async (
  employerId: string
): Promise<AxiosResponse<EmployerPublicProfile>> => {
  return axiosInstance.get<EmployerPublicProfile>(`/api/v1/EmployerProfile/${employerId}`);
};
