import { AxiosResponse } from "axios";
import {
  EmployeePlatformShift,
  EmployeePublicProfile,
  UpsertWorkExperiencePayload,
  WorkExperience,
} from "../models/WorkExperience.model";
import axiosInstance from "./axiosConfig";

export const GetMyWorkExperiences = async (): Promise<AxiosResponse<WorkExperience[]>> => {
  return axiosInstance.get<WorkExperience[]>("/api/v1/EmployeeProfile/me/work-experiences");
};

export const CreateWorkExperience = async(
  payload: UpsertWorkExperiencePayload
): Promise<AxiosResponse<WorkExperience>> => {
  return axiosInstance.post<WorkExperience>("/api/v1/EmployeeProfile/me/work-experiences", payload);
};

export const UpdateWorkExperience = async(
  experienceId: string,
  payload: UpsertWorkExperiencePayload
): Promise<AxiosResponse<WorkExperience>> => {
  return axiosInstance.put<WorkExperience>(
    `/api/v1/EmployeeProfile/me/work-experiences/${experienceId}`,
    payload
  );
};

export const DeleteWorkExperience = async(experienceId: string): Promise<AxiosResponse> => {
  return axiosInstance.delete(`/api/v1/EmployeeProfile/me/work-experiences/${experienceId}`);
};

export const GetMyPlatformShifts = async(): Promise<AxiosResponse<EmployeePlatformShift[]>> => {
  return axiosInstance.get<EmployeePlatformShift[]>("/api/v1/EmployeeProfile/me/platform-shifts");
};

export const GetEmployeePublicProfile = async(
  employeeId: string
): Promise<AxiosResponse<EmployeePublicProfile>> => {
  return axiosInstance.get<EmployeePublicProfile>(`/api/v1/EmployeeProfile/${employeeId}`);
};
