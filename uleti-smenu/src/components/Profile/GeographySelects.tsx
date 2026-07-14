import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GeographyCity,
  GeographyCountry,
  GeographyRegion,
  GeographySelection,
} from "../../models/Geography.model";
import {
  GetGeographyCities,
  GetGeographyCountries,
  GetGeographyRegions,
} from "../../services/geography-service";

interface GeographySelectsProps {
  value: GeographySelection;
  onChange: (value: GeographySelection) => void;
  idPrefix: string;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  disabled?: boolean;
}

const GeographySelects = ({
  value,
  onChange,
  idPrefix,
  className,
  labelClassName,
  selectClassName,
  disabled = false,
}: GeographySelectsProps) => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<GeographyCountry[]>([]);
  const [regions, setRegions] = useState<GeographyRegion[]>([]);
  const [cities, setCities] = useState<GeographyCity[]>([]);
  const [isCountriesLoading, setIsCountriesLoading] = useState(true);
  const [isRegionsLoading, setIsRegionsLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setIsCountriesLoading(true);

    GetGeographyCountries()
      .then(({ data }) => {
        if (active) {
          setCountries(data);
        }
      })
      .catch(() => {
        if (active) {
          setCountries([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsCountriesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setRegions([]);
    setCities([]);

    if (!value.countryCode) {
      return () => {
        active = false;
      };
    }

    setIsRegionsLoading(true);
    GetGeographyRegions(value.countryCode)
      .then(({ data }) => {
        if (active) {
          setRegions(data);
        }
      })
      .catch(() => {
        if (active) {
          setRegions([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsRegionsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [value.countryCode]);

  useEffect(() => {
    let active = true;
    setCities([]);

    if (!value.countryCode || !value.regionCode) {
      return () => {
        active = false;
      };
    }

    setIsCitiesLoading(true);
    GetGeographyCities(value.countryCode, value.regionCode)
      .then(({ data }) => {
        if (active) {
          setCities(data);
        }
      })
      .catch(() => {
        if (active) {
          setCities([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsCitiesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [value.countryCode, value.regionCode]);

  return (
    <>
      <label className={className} htmlFor={`${idPrefix}-country`}>
        <span className={labelClassName}>{t("registration.country")}</span>
        <select
          id={`${idPrefix}-country`}
          className={selectClassName}
          value={value.countryCode}
          disabled={disabled || isCountriesLoading}
          required
          onChange={(event) =>
            onChange({
              countryCode: event.target.value,
              regionCode: "",
              cityCode: "",
            })
          }
        >
          <option value="">{t("geography.selectCountry")}</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </label>

      <label className={className} htmlFor={`${idPrefix}-region`}>
        <span className={labelClassName}>{t("registration.region")}</span>
        <select
          id={`${idPrefix}-region`}
          className={selectClassName}
          value={value.regionCode}
          disabled={disabled || !value.countryCode || isRegionsLoading}
          required
          onChange={(event) =>
            onChange({
              ...value,
              regionCode: event.target.value,
              cityCode: "",
            })
          }
        >
          <option value="">{t("geography.selectRegion")}</option>
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
      </label>

      <label className={className} htmlFor={`${idPrefix}-city`}>
        <span className={labelClassName}>{t("registration.city")}</span>
        <select
          id={`${idPrefix}-city`}
          className={selectClassName}
          value={value.cityCode}
          disabled={disabled || !value.regionCode || isCitiesLoading}
          required
          onChange={(event) =>
            onChange({
              ...value,
              cityCode: event.target.value,
            })
          }
        >
          <option value="">{t("geography.selectCity")}</option>
          {cities.map((city) => (
            <option key={city.code} value={city.code}>
              {city.name}
            </option>
          ))}
        </select>
      </label>
    </>
  );
};

export default GeographySelects;
