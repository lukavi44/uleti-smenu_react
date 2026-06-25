import { Address } from "./Address.model";
import { EmployerSubscription } from "./Subscription.model";

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
    isFavourite: boolean;
    publicSlug?: string;
    subscription?: EmployerSubscription;
}


export interface Employee extends User {
    firstName: string;
    lastName: string;
    city?: string;
  }

  export interface LoginUserDto {
    email: string;
    password: string;
  }

  export type MeResponse = Employer | Employee;