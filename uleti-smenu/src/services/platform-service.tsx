import { PlatformStats } from "../models/PlatformStats.model";
import getApiBaseUrl from "../configuration/config";

const normalizePlatformStats = (data: Record<string, unknown>): PlatformStats => ({
  matchedCount: Number(data.matchedCount ?? data.MatchedCount ?? 0),
  employerCount: Number(data.employerCount ?? data.EmployerCount ?? 0),
  employeeCount: Number(data.employeeCount ?? data.EmployeeCount ?? 0),
});

export const GetPlatformStats = async (): Promise<PlatformStats> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/Platform/stats`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Platform stats request failed with status ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  return normalizePlatformStats(data);
};
