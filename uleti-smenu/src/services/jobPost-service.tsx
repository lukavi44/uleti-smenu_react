import { JobPostDTO } from "../DTOs/JobPost.dto";
import { JobPost } from "../models/JobPost.model";
import axiosInstance from "./axiosConfig"
import { AxiosResponse } from "axios";


export const CreateJobPost = async(body: JobPostDTO): Promise<AxiosResponse<JobPostDTO>> => {
    return axiosInstance.post<JobPostDTO>("/api/v1/JobPost/createJobPost", body);
}

export const GetAllJobPosts = async(): Promise<AxiosResponse<JobPost[]>> => {
    return axiosInstance.get<JobPost[]>("/api/v1/JobPost");
}

export const GetMyJobPosts = async(): Promise<AxiosResponse<JobPost[]>> => {
    return axiosInstance.get<JobPost[]>("/api/v1/JobPost/my");
}

export const UpdateMyJobPost = async(jobPostId: string, body: JobPostDTO): Promise<AxiosResponse<JobPostDTO>> => {
    return axiosInstance.put<JobPostDTO>(`/api/v1/JobPost/my/${jobPostId}`, body);
}