import { AxiosResponse } from "axios";
import {
  GeographyCity,
  GeographyCountry,
  GeographyRegion,
} from "../models/Geography.model";
import axiosInstance from "./axiosConfig";

export const GetGeographyCountries = (): Promise<AxiosResponse<GeographyCountry[]>> =>
  axiosInstance.get("/api/v1/geography/countries");

export const GetGeographyRegions = (
  countryCode: string
): Promise<AxiosResponse<GeographyRegion[]>> =>
  axiosInstance.get("/api/v1/geography/regions", {
    params: { countryCode },
  });

export const GetGeographyCities = (
  countryCode: string,
  regionCode: string
): Promise<AxiosResponse<GeographyCity[]>> =>
  axiosInstance.get("/api/v1/geography/cities", {
    params: { countryCode, regionCode },
  });
