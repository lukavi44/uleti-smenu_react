import { Address } from "./Address.model";

export interface User {
    id: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: Address;
    profilePhoto?: string;
}

export interface Employer extends User {
    name: string;
    pib: string;
    mb: string;
}


export interface Employee extends User {
    firstName: string;
    lastName: string;
  }

  export interface LoginUserDto {
    email: string;
    password: string;
  }