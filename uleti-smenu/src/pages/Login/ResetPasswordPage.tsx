import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import AuthPageLayout from "../../components/Auth/AuthPageLayout";
import AuthTextField from "../../components/Auth/AuthTextField";
import layoutStyles from "../../components/Auth/AuthPageLayout.module.scss";
import { ResetPasswordRequest } from "../../services/auth-service";

type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const schema = yup.object().shape({
    password: yup
      .string()
      .min(10, t("registration.passwordMin"))
      .matches(/[^a-zA-Z0-9]/, t("registration.passwordSpecial"))
      .matches(/[A-Z]/, t("registration.passwordUpper"))
      .matches(/[a-z]/, t("registration.passwordLower"))
      .matches(/[0-9]/, t("registration.passwordDigit"))
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
  } = useForm<ResetPasswordValues>({
    resolver: yupResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ password }: ResetPasswordValues) => {
    if (!email || !token) {
      toast.error(t("passwordReset.invalidLink"));
      return;
    }

    try {
      await ResetPasswordRequest(email, token, password);
      toast.success(t("passwordReset.resetSuccess"));
      navigate("/login", { replace: true });
    } catch {
      toast.error(t("passwordReset.resetError"));
    }
  };

  return (
    <AuthPageLayout>
      <h1 className={layoutStyles.title}>{t("passwordReset.resetTitle")}</h1>
      <p className={layoutStyles.subtitle}>{t("passwordReset.resetSubtitle")}</p>

      <form className={layoutStyles.form} onSubmit={handleSubmit(onSubmit)}>
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
              error={errors.password?.message}
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
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <button type="submit" className={layoutStyles.submitButton} disabled={isSubmitting || !email || !token}>
          {isSubmitting ? t("common.loading") : t("passwordReset.resetPassword")}
        </button>
      </form>

      <p className={layoutStyles.footerLine}>
        <Link to="/login">{t("passwordReset.backToLogin")}</Link>
      </p>
    </AuthPageLayout>
  );
};

export default ResetPasswordPage;
