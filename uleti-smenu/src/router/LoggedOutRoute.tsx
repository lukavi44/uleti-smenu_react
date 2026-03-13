import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";
import { useTranslation } from "react-i18next";

const LoggedOutRoute = () => {
  const { t } = useTranslation();
  const { authStatus } = useContext(AuthContext);

  if (authStatus === "loading") {
    return <div>{t("common.loading")}</div>;
  }

  return authStatus === "authenticated" ? <Navigate to="/" replace /> : <Outlet />;
};

export default LoggedOutRoute;
