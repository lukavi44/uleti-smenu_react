import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";
import { useTranslation } from "react-i18next";

const RequireAuth = () => {
    const { t } = useTranslation();
    const { authStatus } = useContext(AuthContext);

    if (authStatus === "loading") return <div>{t("common.loading")}</div>;
    
    return authStatus === "authenticated" ? <Outlet /> : <Navigate to="/login" replace />;
  };
  

export default RequireAuth;
