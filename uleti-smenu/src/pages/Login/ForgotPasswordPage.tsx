import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import AuthPageLayout from "../../components/Auth/AuthPageLayout";
import AuthTextField from "../../components/Auth/AuthTextField";
import layoutStyles from "../../components/Auth/AuthPageLayout.module.scss";
import { ForgotPasswordRequest } from "../../services/auth-service";

type ForgotPasswordValues = {
  email: string;
};

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const schema = yup.object().shape({
    email: yup.string().email(t("registration.invalidEmail")).required(t("login.emailRequired")),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: ForgotPasswordValues) => {
    try {
      await ForgotPasswordRequest(email);
      toast.success(t("passwordReset.requestSuccess"));
    } catch {
      toast.error(t("passwordReset.requestError"));
    }
  };

  return (
    <AuthPageLayout>
      <h1 className={layoutStyles.title}>{t("passwordReset.forgotTitle")}</h1>
      <p className={layoutStyles.subtitle}>{t("passwordReset.forgotSubtitle")}</p>

      <form className={layoutStyles.form} onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AuthTextField
              {...field}
              label={t("login.email")}
              type="email"
              autoComplete="email"
              placeholder={t("login.emailPlaceholder")}
              leadingIcon={<EnvelopeIcon />}
              error={errors.email?.message}
            />
          )}
        />

        <button type="submit" className={layoutStyles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? t("common.loading") : t("passwordReset.sendLink")}
        </button>
      </form>

      <p className={layoutStyles.footerLine}>
        <Link to="/login">{t("passwordReset.backToLogin")}</Link>
      </p>
    </AuthPageLayout>
  );
};

export default ForgotPasswordPage;
