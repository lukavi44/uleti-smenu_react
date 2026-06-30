import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";
import { useTranslation } from "react-i18next";

const RequireAdmin = () => {
  const { t } = useTranslation();
  const { authStatus, role } = useContext(AuthContext);
  const location = useLocation();

  if (authStatus === "loading") {
    return <div>{t("common.loading")}</div>;
  }

  if (authStatus === "authenticated" && role === "Admin") {
    return <Outlet />;
  }

  if (authStatus === "authenticated") {
    return <Navigate to="/" replace />;
  }

  const returnUrl = encodeURIComponent(`${location.pathname}${location.search}`);
  return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
};

export default RequireAdmin;
