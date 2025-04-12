import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";
import LoadingContext from "../store/Loading-context";

const LoggedOutRoute = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const { isLoading } = useContext(LoadingContext);

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return isLoggedIn ? <Navigate to="/" replace /> : <Outlet />;
};

export default LoggedOutRoute;
