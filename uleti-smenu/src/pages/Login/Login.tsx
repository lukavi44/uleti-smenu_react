import { useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { LoginUserRequest } from "../../services/auth-service";
import { LoginUserDto } from "../../models/User.model";
import { AuthContext } from "../../store/Auth-context";
import { useTranslation } from "react-i18next";
import AuthPageLayout from "../../components/Auth/AuthPageLayout";
import AuthTextField from "../../components/Auth/AuthTextField";
import layoutStyles from "../../components/Auth/AuthPageLayout.module.scss";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { refreshAuthState } = useContext(AuthContext);

  const schema = yup.object().shape({
    email: yup.string().email().required(t("login.emailRequired")),
    password: yup
      .string()
      .min(6, t("login.passwordMin"))
      .required(t("login.passwordRequired")),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserDto>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (searchParams.get("registered") !== "1") {
      return;
    }

    toast.success(t("registration.success"));
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("registered");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, t]);

  const onSubmit = async (data: LoginUserDto) => {
    setLoading(true);
    try {
      const response = await LoginUserRequest(data);
      toast.success(t("login.success"));
      localStorage.setItem("AccessToken", response.data.accessToken);
      localStorage.setItem("RefreshToken", response.data.refreshToken);
      await refreshAuthState();
      const returnUrl = searchParams.get("returnUrl");
      const safeReturnUrl =
        returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//") ? returnUrl : "/";
      navigate(safeReturnUrl);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      if (axios.isAxiosError(error)) {
        toast.error(t("login.invalidCredentials"));
      } else {
        toast.error(t("common.unexpectedServerError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <h1 className={layoutStyles.title}>{t("login.welcomeTitle")}</h1>
      <p className={layoutStyles.subtitle}>{t("login.welcomeSubtitle")}</p>

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

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <AuthTextField
              {...field}
              label={t("login.password")}
              type="password"
              autoComplete="current-password"
              placeholder={t("login.passwordPlaceholder")}
              leadingIcon={<LockClosedIcon />}
              showPasswordToggle
              error={errors.password?.message}
            />
          )}
        />

        <div className={layoutStyles.formMeta}>
          <label className={layoutStyles.rememberMe}>
            <input type="checkbox" />
            <span>{t("login.rememberMe")}</span>
          </label>
          <span className={layoutStyles.forgotPassword}>{t("login.forgotPassword")}</span>
        </div>

        <button type="submit" className={layoutStyles.submitButton} disabled={loading}>
          {loading ? t("common.loading") : t("login.submit")}
        </button>
      </form>

      <p className={layoutStyles.footerLine}>
        {t("login.registerPrompt")}{" "}
        <Link to="/registration">{t("login.registerLink")}</Link>
      </p>
    </AuthPageLayout>
  );
};

export default LoginPage;
