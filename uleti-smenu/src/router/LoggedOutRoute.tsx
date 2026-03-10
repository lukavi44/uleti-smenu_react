import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";

const LoggedOutRoute = () => {
  const { authStatus } = useContext(AuthContext);

  if (authStatus === "loading") {
    return <div>Loading...</div>;
  }

  return authStatus === "authenticated" ? <Navigate to="/" replace /> : <Outlet />;
};

export default LoggedOutRoute;
