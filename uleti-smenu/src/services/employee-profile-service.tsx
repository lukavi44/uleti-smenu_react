import { AxiosResponse } from "axios";
import { PagedResult } from "../models/PagedResult.model";
import { Review } from "../models/Review.model";
import {
  EmployeePlatformShift,
  EmployeePublicProfile,
  UpsertWorkExperiencePayload,
  WorkExperience,
} from "../models/WorkExperience.model";
import axiosInstance from "./axiosConfig";
import { CANDIDATE_SECTION_PAGE_SIZE } from "../constants/pagination";

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

export const GetEmployeePublicReviews = async(
  employeeId: string,
  page = 1,
  pageSize = CANDIDATE_SECTION_PAGE_SIZE
): Promise<AxiosResponse<PagedResult<Review>>> => {
  return axiosInstance.get<PagedResult<Review>>(`/api/v1/EmployeeProfile/${employeeId}/reviews`, {
    params: { page, pageSize },
  });
};

export const GetEmployeePublicWorkExperiences = async(
  employeeId: string,
  page = 1,
  pageSize = CANDIDATE_SECTION_PAGE_SIZE
): Promise<AxiosResponse<PagedResult<WorkExperience>>> => {
  return axiosInstance.get<PagedResult<WorkExperience>>(
    `/api/v1/EmployeeProfile/${employeeId}/work-experiences`,
    { params: { page, pageSize } }
  );
};

export const GetEmployeePublicPlatformShifts = async(
  employeeId: string,
  page = 1,
  pageSize = CANDIDATE_SECTION_PAGE_SIZE
): Promise<AxiosResponse<PagedResult<EmployeePlatformShift>>> => {
  return axiosInstance.get<PagedResult<EmployeePlatformShift>>(
    `/api/v1/EmployeeProfile/${employeeId}/platform-shifts`,
    { params: { page, pageSize } }
  );
};
