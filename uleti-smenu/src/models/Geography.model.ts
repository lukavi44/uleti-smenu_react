export interface GeographyCountry {
  code: string;
  name: string;
  nativeName: string;
}

export interface GeographyRegion {
  code: string;
  countryCode: string;
  name: string;
  nativeName: string;
}

export interface GeographyCity {
  code: string;
  regionCode: string;
  name: string;
  nativeName: string;
}

export interface GeographySelection {
  countryCode: string;
  regionCode: string;
  cityCode: string;
}
