import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { RegisterEmployeeDTO, RegisterEmployerDTO } from "../../DTOs/Register.dto";
import { RegistrationEmployeeRequest, RegistrationEmployerRequest } from "../../services/auth-service";
import { useTranslation } from "react-i18next";
import AuthPageLayout from "../../components/Auth/AuthPageLayout";
import AuthTextField from "../../components/Auth/AuthTextField";
import layoutStyles from "../../components/Auth/AuthPageLayout.module.scss";

interface RegistrationFormProps {
  userType: "employer" | "employee";
}

type RegistrationFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

const RegistrationPage = ({ userType }: RegistrationFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isEmployer = userType === "employer";

  const schema = yup.object().shape({
    email: yup.string().email(t("registration.invalidEmail")).required(t("registration.emailRequired")),
    password: yup
      .string()
      .min(8, t("registration.passwordMin"))
      .matches(/[^a-zA-Z0-9]/, t("registration.passwordSpecial"))
      .matches(/[A-Z]/, t("registration.passwordUpper"))
      .required(t("registration.passwordRequired")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("registration.passwordsMustMatch"))
      .required(t("registration.confirmPasswordRequired")),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData: RegistrationFormValues) => {
    try {
      const payload = { email: formData.email, password: formData.password };
      if (isEmployer) {
        await RegistrationEmployerRequest(payload as RegisterEmployerDTO);
      } else {
        await RegistrationEmployeeRequest(payload as RegisterEmployeeDTO);
      }

      navigate("/login?registered=1", { replace: true });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: string } })?.response?.data;
      if (typeof message === "string" && (message.includes("DuplicateUserName") || message.includes("Email already exists"))) {
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
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <AuthTextField
              {...field}
              label={t("registration.confirmPassword")}
              type="password"
              autoComplete="new-password"
              placeholder={t("login.passwordPlaceholder")}
              leadingIcon={<LockClosedIcon />}
              showPasswordToggle
              error={getErrorMessage("confirmPassword")}
            />
          )}
        />

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
