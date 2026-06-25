import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";
import { useTranslation } from "react-i18next";

const RequireAuth = () => {
    const { t } = useTranslation();
    const { authStatus } = useContext(AuthContext);
    const location = useLocation();

    if (authStatus === "loading") return <div>{t("common.loading")}</div>;

    if (authStatus === "authenticated") {
        return <Outlet />;
    }

    const returnUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  };
  

export default RequireAuth;
