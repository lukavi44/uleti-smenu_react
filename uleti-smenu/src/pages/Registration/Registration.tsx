import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";

import { RegisterEmployeeDTO, RegisterEmployerDTO } from "../../DTOs/Register.dto";
import {
    TextField,
    Button,
    Typography,
    Container,
    Box,
  } from "@mui/material";

import { RegistrationEmployeeRequest, RegistrationEmployerRequest } from "../../services/auth-service";
import { useNavigate } from "react-router-dom";

interface RegistrationFormProps {
    userType: "employer" | "employee";
  }

  const commonSchema = {
    email: yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: yup.string().required("Phone number is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[^a-zA-Z0-9]/, "Must have at least one special character")
      .matches(/[A-Z]/, "Must have at least one uppercase letter")
      .required("Password is required"),
  };

  const employerSchema = yup.object().shape({
    ...commonSchema,
    name: yup.string().required("Company name is required"),
    pib: yup.string().length(9).required("Pib is required and must contain 9 characters"),
    mb: yup.string().length(8).required("mb is required and must contain 8 characters"),
    streetName: yup.string().required("Street name is required"),
    streetNumber: yup.string().required("Street number is required"),
    city: yup.string().required("City name is required"),
    postalCode: yup.string().required("Postal code is required"),
    country: yup.string().required("Country name is required"),
    region: yup.string().required("Region name is required")
  });

  const employeeSchema = yup.object().shape({
    ...commonSchema,
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required")
    // dateOfBirth: yup.string().required("Date of birth is required"),
  });

  const employerFields = [
    { name: "name", label: "Name" },
    { name: "pib", label: "PIB" },
    { name: "mb", label: "MB" },
    { name: "streetName", label: "Street Name" },
    { name: "streetNumber", label: "Street Number" },
    { name: "city", label: "City" },
    { name: "postalCode", label: "Postal Code" },
    { name: "country", label: "Country" },
    { name: "region", label: "Region" },
  ];
  
  const employeeFields = [
    { name: "firstName", label: "First Name" },
    { name: "lastName", label: "Last Name" },
    // { name: "dateOfBirth", label: "Date of birth", type: "date"}
  ];

const RegistrationPage = ({userType}: RegistrationFormProps) => {
    const navigate = useNavigate();
    const isEmployer = userType === "employer";

    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<RegisterEmployerDTO | RegisterEmployeeDTO>({
      resolver: yupResolver(isEmployer ? (employerSchema as any) : (employeeSchema as any)),
      defaultValues: (isEmployer
        ? ({
            email: "",
            phoneNumber: "",
            password: "",
            name: "",
            pib: "",
            mb: "",
            streetName: "",
            streetNumber: "",
            city: "",
            postalCode: "",
            country: "",
            region: "",
          } as RegisterEmployerDTO)
        : ({
            email: "",
            phoneNumber: "",
            password: "",
            firstName: "",
            lastName: "",
          } as RegisterEmployeeDTO)),
        });

      const onSubmit = async (formData: any) => {
        try {
          if (isEmployer) {
            await RegistrationEmployerRequest(formData);
            toast.success("Please check your email to confirm registration.");
            navigate("/login");
          } else if (!isEmployer) {
            await RegistrationEmployeeRequest(formData);
            toast.success("Please check your email to confirm registration.");
            navigate("/login");
          }
        } catch (error: any) {
          if (error.response?.data?.includes("DuplicateUserName")) {
            toast.error("User already exists.");
          } else {
            toast.error("An error occurred during registration.");
          }
        }
      };
      
      const getErrorMessage = <T extends keyof RegisterEmployerDTO | keyof RegisterEmployeeDTO>(
        fieldName: T
      ) => {
        return errors[fieldName as keyof typeof errors]?.message ?? "";
      };
      
      const getHasError = <T extends keyof RegisterEmployerDTO | keyof RegisterEmployeeDTO>(
        fieldName: T
      ) => {
        return !!errors[fieldName as keyof typeof errors];
      };
      
      return (
        <Container maxWidth="sm">
          <Box mt={2} mb={2} p={3} sx={{ border: "1px solid #ddd", borderRadius: 2 }}>
            <Typography variant="h4" textAlign="center" gutterBottom>
              {isEmployer ? "Employer Registration" : "Employee Registration"}
            </Typography>
    
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" type="email" fullWidth margin="normal"
                    error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Password" type="password" fullWidth margin="normal"
                    error={!!errors.password} helperText={errors.password?.message} />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Phone Number" fullWidth margin="normal"
                    error={!!errors.phoneNumber} helperText={errors.phoneNumber?.message} />
                )}
              />
    
              {isEmployer
                ? employerFields.map((field) => (
                    <Controller
                        key={field.name}
                        name={field.name as keyof RegisterEmployerDTO}
                        control={control}
                        render={({ field: inputField }) => (
                          <TextField
                            {...inputField}
                            label={field.label}
                            fullWidth
                            margin="normal"
                            error={getHasError(field.name as keyof RegisterEmployerDTO)}
                            helperText={getErrorMessage(field.name as keyof RegisterEmployerDTO)}
                            />
                        )}
                    />
                  ))
                : employeeFields.map((field) => (
                    <Controller
                      key={field.name}
                      name={field.name as keyof RegisterEmployeeDTO}
                      control={control}
                      render={({ field: inputField }) => (
                        <TextField 
                        {...inputField}
                        type="text"
                        // type={field.type || "text"}
                        // InputLabelProps={field.type === "date" ? { shrink: true } : undefined} 
                        label={field.label} 
                        fullWidth margin="normal"
                        error={getHasError(field.name as keyof RegisterEmployeeDTO)}
                        helperText={getErrorMessage(field.name as keyof RegisterEmployeeDTO)}/>
                      )}
                    />
                  ))}
    
              {/* Submit & Navigation Buttons */}
              <Box mt={2} display="flex" flexDirection="column" gap={2}>
                <Button variant="contained" color="primary" type="submit">
                  Register
                </Button>
                <Button color="secondary" onClick={() => navigate("/login")}>
                  Already have an account? Login
                </Button>
              </Box>
            </form>
          </Box>
        </Container>
      );
}

export default RegistrationPage;