import { AxiosResponse } from "axios";
import { BillingOverview, BillingPlan } from "../models/Billing.model";
import axiosInstance from "./axiosConfig";

export const GetBillingPlans = async (): Promise<AxiosResponse<BillingPlan[]>> => {
  return axiosInstance.get<BillingPlan[]>("/api/v1/Billing/plans");
};

export const GetMyBilling = async (): Promise<AxiosResponse<BillingOverview>> => {
  return axiosInstance.get<BillingOverview>("/api/v1/Billing/me");
};
