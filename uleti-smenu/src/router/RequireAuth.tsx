import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";

const RequireAuth = () => {
    const { authStatus } = useContext(AuthContext);

    if (authStatus === "loading") return <div>Loading...</div>;
    
    return authStatus === "authenticated" ? <Outlet /> : <Navigate to="/login" replace />;
  };
  

export default RequireAuth;
