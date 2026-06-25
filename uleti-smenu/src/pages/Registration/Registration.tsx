import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { RegisterEmployeeDTO, RegisterEmployerDTO } from "../../DTOs/Register.dto";
import { RegistrationEmployeeRequest, RegistrationEmployerRequest } from "../../services/auth-service";
import { useTranslation } from "react-i18next";
import AuthPageLayout from "../../components/Auth/AuthPageLayout";
import AuthTextField from "../../components/Auth/AuthTextField";
import layoutStyles from "../../components/Auth/AuthPageLayout.module.scss";

interface RegistrationFormProps {
  userType: "employer" | "employee";
}

type EmployerFieldName = keyof RegisterEmployerDTO;
type EmployeeFieldName = keyof RegisterEmployeeDTO;

const RegistrationPage = ({ userType }: RegistrationFormProps) => {
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
    region: yup.string().required(t("registration.regionRequired")),
  });

  const employeeSchema = yup.object().shape({
    ...commonSchema,
    firstName: yup.string().required(t("registration.firstNameRequired")),
    lastName: yup.string().required(t("registration.lastNameRequired")),
  });

  const employerFields: { name: EmployerFieldName; label: string; placeholder: string }[] = [
    { name: "name", label: t("registration.name"), placeholder: t("registration.placeholders.name") },
    { name: "pib", label: t("registration.pib"), placeholder: t("registration.placeholders.pib") },
    { name: "mb", label: t("registration.mb"), placeholder: t("registration.placeholders.mb") },
    { name: "streetName", label: t("registration.streetName"), placeholder: t("registration.placeholders.streetName") },
    { name: "streetNumber", label: t("registration.streetNumber"), placeholder: t("registration.placeholders.streetNumber") },
    { name: "city", label: t("registration.city"), placeholder: t("registration.placeholders.city") },
    { name: "postalCode", label: t("registration.postalCode"), placeholder: t("registration.placeholders.postalCode") },
    { name: "country", label: t("registration.country"), placeholder: t("registration.placeholders.country") },
    { name: "region", label: t("registration.region"), placeholder: t("registration.placeholders.region") },
  ];

  const employeeFields: { name: EmployeeFieldName; label: string; placeholder: string }[] = [
    { name: "firstName", label: t("registration.firstName"), placeholder: t("registration.placeholders.firstName") },
    { name: "lastName", label: t("registration.lastName"), placeholder: t("registration.placeholders.lastName") },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterEmployerDTO | RegisterEmployeeDTO>({
    resolver: yupResolver(isEmployer ? (employerSchema as any) : (employeeSchema as any)),
    defaultValues: isEmployer
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
        } as RegisterEmployeeDTO),
  });

  const onSubmit = async (formData: RegisterEmployerDTO | RegisterEmployeeDTO) => {
    try {
      if (isEmployer) {
        await RegistrationEmployerRequest(formData as RegisterEmployerDTO);
      } else {
        await RegistrationEmployeeRequest(formData as RegisterEmployeeDTO);
      }

      navigate("/login?registered=1", { replace: true });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: string } })?.response?.data;
      if (typeof message === "string" && message.includes("DuplicateUserName")) {
        toast.error(t("registration.duplicateUser"));
      } else {
        toast.error(t("registration.failed"));
      }
    }
  };

  const getErrorMessage = (fieldName: string) =>
    errors[fieldName as keyof typeof errors]?.message ?? "";

  return (
    <AuthPageLayout
      visualCaption={
        isEmployer ? t("registration.visualCaptionEmployer") : t("registration.visualCaptionEmployee")
      }
    >
      <h1 className={layoutStyles.title}>
        {isEmployer ? t("registration.employerWelcomeTitle") : t("registration.employeeWelcomeTitle")}
      </h1>
      <p className={layoutStyles.subtitle}>
        {isEmployer ? t("registration.employerWelcomeSubtitle") : t("registration.employeeWelcomeSubtitle")}
      </p>

      <form className={layoutStyles.form} onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AuthTextField
              {...field}
              label={t("registration.email")}
              type="email"
              autoComplete="email"
              placeholder={t("login.emailPlaceholder")}
              leadingIcon={<EnvelopeIcon />}
              error={getErrorMessage("email")}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <AuthTextField
              {...field}
              label={t("registration.password")}
              type="password"
              autoComplete="new-password"
              placeholder={t("login.passwordPlaceholder")}
              leadingIcon={<LockClosedIcon />}
              showPasswordToggle
              error={getErrorMessage("password")}
            />
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <AuthTextField
              {...field}
              label={t("registration.phoneNumber")}
              type="tel"
              autoComplete="tel"
              placeholder={t("registration.placeholders.phoneNumber")}
              leadingIcon={<PhoneIcon />}
              error={getErrorMessage("phoneNumber")}
            />
          )}
        />

        {isEmployer
          ? employerFields.map((field) => (
              <Controller
                key={field.name}
                name={field.name}
                control={control}
                render={({ field: inputField }) => (
                  <AuthTextField
                    {...inputField}
                    label={field.label}
                    placeholder={field.placeholder}
                    error={getErrorMessage(field.name)}
                  />
                )}
              />
            ))
          : employeeFields.map((field) => (
              <Controller
                key={field.name}
                name={field.name}
                control={control}
                render={({ field: inputField }) => (
                  <AuthTextField
                    {...inputField}
                    label={field.label}
                    placeholder={field.placeholder}
                    error={getErrorMessage(field.name)}
                  />
                )}
              />
            ))}

        <button type="submit" className={layoutStyles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? t("common.loading") : t("registration.submit")}
        </button>
      </form>

      <p className={layoutStyles.footerLine}>
        <Link to="/registration">{t("registration.backToChoice")}</Link>
      </p>

      <p className={layoutStyles.footerLine}>
        {t("registration.loginPrompt")}{" "}
        <Link to="/login">{t("registration.loginLink")}</Link>
      </p>
    </AuthPageLayout>
  );
};

export default RegistrationPage;
