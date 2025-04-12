import { AxiosResponse } from "axios";
import { RegisterEmployeeDTO, RegisterEmployerDTO } from "../DTOs/Register.dto";
import axiosInstance from "./axiosConfig";
import { LoginUserDto } from "../models/User.model";

export interface LoginResponseData {
    accessToken: string;
    refreshToken: string;
  }

export const RegistrationEmployerRequest = async (
    body: RegisterEmployerDTO
  ): Promise<AxiosResponse<RegisterEmployerDTO>> => {
    const updatedBody = {
        ...body,
        name: body.name,
        username: body.email
    }
    return axiosInstance.post<RegisterEmployerDTO>("/api/v1/User/register/employer", updatedBody);
  };

  export const RegistrationEmployeeRequest = async (
    body: RegisterEmployeeDTO
  ): Promise<AxiosResponse<RegisterEmployeeDTO>> => {
    return axiosInstance.post<RegisterEmployeeDTO>("/api/v1/User/register/employer", body);
  };

  export const LoginUserRequest = async (
    body: LoginUserDto
  ): Promise<AxiosResponse<LoginResponseData>> => {
    return axiosInstance.post<LoginResponseData>("/login", body);
  }

  export const LogoutUserRequest = async (): Promise<AxiosResponse> => {
    return axiosInstance.post("api/v1/User/logout");
  };