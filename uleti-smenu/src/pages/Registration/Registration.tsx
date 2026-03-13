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
import { useTranslation } from "react-i18next";

interface RegistrationFormProps {
    userType: "employer" | "employee";
  }

const RegistrationPage = ({userType}: RegistrationFormProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isEmployer = userType === "employer";
    const commonSchema = {
      email: yup.string().email(t("registration.invalidEmail")).required(t("registration.emailRequired")),
      phoneNumber: yup.string().required(t("registration.phoneRequired")),
      password: yup
        .string()
        .min(8, t("registration.passwordMin"))
        .matches(/[^a-zA-Z0-9]/, t("registration.passwordSpecial"))
        .matches(/[A-Z]/, t("registration.passwordUpper"))
        .required(t("registration.passwordRequired")),
    };

    const employerSchema = yup.object().shape({
      ...commonSchema,
      name: yup.string().required(t("registration.companyRequired")),
      pib: yup.string().length(9).required(t("registration.pibRequired")),
      mb: yup.string().length(8).required(t("registration.mbRequired")),
      streetName: yup.string().required(t("registration.streetNameRequired")),
      streetNumber: yup.string().required(t("registration.streetNumberRequired")),
      city: yup.string().required(t("registration.cityRequired")),
      postalCode: yup.string().required(t("registration.postalCodeRequired")),
      country: yup.string().required(t("registration.countryRequired")),
      region: yup.string().required(t("registration.regionRequired"))
    });

    const employeeSchema = yup.object().shape({
      ...commonSchema,
      firstName: yup.string().required(t("registration.firstNameRequired")),
      lastName: yup.string().required(t("registration.lastNameRequired"))
    });

    const employerFields = [
      { name: "name", label: t("registration.name") },
      { name: "pib", label: t("registration.pib") },
      { name: "mb", label: t("registration.mb") },
      { name: "streetName", label: t("registration.streetName") },
      { name: "streetNumber", label: t("registration.streetNumber") },
      { name: "city", label: t("registration.city") },
      { name: "postalCode", label: t("registration.postalCode") },
      { name: "country", label: t("registration.country") },
      { name: "region", label: t("registration.region") },
    ];
    
    const employeeFields = [
      { name: "firstName", label: t("registration.firstName") },
      { name: "lastName", label: t("registration.lastName") },
    ];

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
            toast.success(t("registration.success"));
            navigate("/login");
          } else if (!isEmployer) {
            await RegistrationEmployeeRequest(formData);
            toast.success(t("registration.success"));
            navigate("/login");
          }
        } catch (error: any) {
          if (error.response?.data?.includes("DuplicateUserName")) {
            toast.error(t("registration.duplicateUser"));
          } else {
            toast.error(t("registration.failed"));
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
              {isEmployer ? t("registration.employerTitle") : t("registration.employeeTitle")}
            </Typography>
    
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t("registration.email")} type="email" fullWidth margin="normal"
                    error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t("registration.password")} type="password" fullWidth margin="normal"
                    error={!!errors.password} helperText={errors.password?.message} />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t("registration.phoneNumber")} fullWidth margin="normal"
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
                  {t("registration.submit")}
                </Button>
                <Button color="secondary" onClick={() => navigate("/login")}>
                  {t("registration.hasAccount")}
                </Button>
              </Box>
            </form>
          </Box>
        </Container>
      );
}

export default RegistrationPage;