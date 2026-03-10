export type Role = "Employer" | "Employee" | "Admin";

export interface UserBase {
  id: string;
  email: string;
  phoneNumber: string;
  role: Role;
}

export interface EmployerDTO extends UserBase {
  name: string;
  profilePhoto: string;
}

export interface EmployeeDTO extends UserBase {
  firstName: string;
  lastName: string;
}

export interface AdminDTO extends UserBase {
  adminLevel: number;
}

export type MeResponse = EmployerDTO | EmployeeDTO | AdminDTO;