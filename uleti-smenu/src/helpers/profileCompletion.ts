import { Employee } from "../models/User.model";

export const calculateEmployeeProfileCompletion = (
  employee: Employee,
  hasWorkExperience: boolean
): number => {
  const checks = [
    Boolean(employee.firstName?.trim()),
    Boolean(employee.lastName?.trim()),
    Boolean(employee.email?.trim()),
    Boolean(employee.phoneNumber?.trim()),
    Boolean(employee.profilePhoto),
    Boolean(employee.city?.trim() || employee.address?.city?.name?.trim()),
    hasWorkExperience,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};
