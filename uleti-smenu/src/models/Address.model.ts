export interface Address {
    street: Street;
    city: City;
  }
  export interface City {
    name: string;
    postalCode: number;
    country: string
    region: string;
  }
  
  export interface Street {
    name: string;
    number: number;
  }