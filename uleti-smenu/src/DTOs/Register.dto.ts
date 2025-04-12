export interface RegisterEmployerDTO {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    pib: string;
    mb: string;
    streetName: string,
    streetNumber: string,
    city: string,
    postalCode: string,
    country: string,
    region: string
  }

  export interface RegisterEmployeeDTO {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }  
  