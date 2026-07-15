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
    return axiosInstance.post<RegisterEmployerDTO>("/api/v1/User/register/employer", body);
  };

  export const RegistrationEmployeeRequest = async (
    body: RegisterEmployeeDTO
  ): Promise<AxiosResponse<RegisterEmployeeDTO>> => {
    return axiosInstance.post<RegisterEmployeeDTO>("/api/v1/User/register/employee", body);
  };

  export const LoginUserRequest = async (
    body: LoginUserDto
  ): Promise<AxiosResponse<LoginResponseData>> => {
    return axiosInstance.post<LoginResponseData>("/login", body);
  }

  export const LogoutUserRequest = async (): Promise<AxiosResponse> => {
    return axiosInstance.post("/api/v1/User/logout");
  };

  export const ForgotPasswordRequest = async (
    email: string
  ): Promise<AxiosResponse<{ message: string }>> => {
    return axiosInstance.post("/api/v1/User/forgot-password", { email });
  };

  export const ResetPasswordRequest = async (
    email: string,
    token: string,
    password: string
  ): Promise<AxiosResponse<{ message: string }>> => {
    return axiosInstance.post("/api/v1/User/reset-password", { email, token, password });
  };

  export const ChangePasswordRequest = async (
    oldPassword: string,
    newPassword: string
  ): Promise<AxiosResponse> => {
    return axiosInstance.post("/manage/info", { oldPassword, newPassword });
  };