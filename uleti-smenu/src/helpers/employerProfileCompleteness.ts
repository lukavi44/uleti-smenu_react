import { Employer } from "../models/User.model";

export type EmployerMissingProfileField =
  | "name"
  | "phone"
  | "address"
  | "pib"
  | "mb";

export type EmployerProfileCompleteness = {
  isComplete: boolean;
  missing: Record<EmployerMissingProfileField, boolean>;
};

const hasText = (value: unknown) => String(value ?? "").trim().length > 0;

type AddressLike = {
  street?: { name?: string; number?: string | number } | string;
  streetName?: string;
  streetNumber?: string | number;
  city?: { name?: string; postalCode?: string | number; country?: string; region?: string } | string;
  postalCode?: string | number;
  country?: string;
  region?: string;
};

const readAddressParts = (address: AddressLike | null | undefined) => {
  const streetName =
    typeof address?.street === "string"
      ? address.street
      : address?.street?.name ?? address?.streetName ?? "";

  const streetNumber =
    typeof address?.street === "object" && address.street
      ? address.street.number
      : address?.streetNumber ?? "";

  const cityName =
    typeof address?.city === "string"
      ? address.city
      : address?.city?.name ?? "";

  const postalCode =
    typeof address?.city === "object" && address.city
      ? address.city.postalCode
      : address?.postalCode ?? "";

  const country =
    typeof address?.city === "object" && address.city
      ? address.city.country
      : address?.country ?? "";

  const region =
    typeof address?.city === "object" && address.city
      ? address.city.region
      : address?.region ?? "";

  return { streetName, streetNumber, cityName, postalCode, country, region };
};

export const getEmployerProfileCompleteness = (
  employer: Employer | null | undefined
): EmployerProfileCompleteness => {
  const nameMissing = !hasText(employer?.name);
  const phoneMissing = !hasText(employer?.phoneNumber);
  const pibMissing = !hasText(employer?.pib);
  const mbMissing = !hasText(employer?.mb);

  const parts = readAddressParts(employer?.address as AddressLike | undefined);
  const addressMissing =
    !hasText(parts.streetName) ||
    !hasText(parts.streetNumber) ||
    !hasText(parts.cityName) ||
    !hasText(parts.postalCode) ||
    !hasText(parts.country) ||
    !hasText(parts.region);

  const missing = {
    name: nameMissing,
    phone: phoneMissing,
    address: addressMissing,
    pib: pibMissing,
    mb: mbMissing,
  };

  return {
    isComplete: !Object.values(missing).some(Boolean),
    missing,
  };
};

export const isEmployerProfileComplete = (employer: Employer | null | undefined) =>
  getEmployerProfileCompleteness(employer).isComplete;
