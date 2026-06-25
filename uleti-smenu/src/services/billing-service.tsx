import { AxiosResponse } from "axios";
import {
  BillingOverview,
  BillingPlan,
  CheckoutSessionResponse,
  PortalSessionResponse,
  WalletTransaction,
} from "../models/Billing.model";
import axiosInstance from "./axiosConfig";

export const GetBillingPlans = async (): Promise<AxiosResponse<BillingPlan[]>> => {
  return axiosInstance.get<BillingPlan[]>("/api/v1/Billing/plans");
};

export const GetMyBilling = async (): Promise<AxiosResponse<BillingOverview>> => {
  return axiosInstance.get<BillingOverview>("/api/v1/Billing/me");
};

export const GetWalletTransactions = async (
  limit = 20
): Promise<AxiosResponse<WalletTransaction[]>> => {
  return axiosInstance.get<WalletTransaction[]>("/api/v1/Billing/wallet/transactions", {
    params: { limit },
  });
};

export const CreateCheckoutSession = async (
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<AxiosResponse<CheckoutSessionResponse>> => {
  return axiosInstance.post<CheckoutSessionResponse>("/api/v1/Billing/checkout", {
    planId,
    successUrl,
    cancelUrl,
  });
};

export const CreateWalletTopUpSession = async (
  amount: number,
  successUrl: string,
  cancelUrl: string
): Promise<AxiosResponse<CheckoutSessionResponse>> => {
  return axiosInstance.post<CheckoutSessionResponse>("/api/v1/Billing/wallet/topup", {
    amount,
    successUrl,
    cancelUrl,
  });
};

export const CreatePortalSession = async (
  returnUrl: string
): Promise<AxiosResponse<PortalSessionResponse>> => {
  return axiosInstance.post<PortalSessionResponse>("/api/v1/Billing/portal", {
    returnUrl,
  });
};
