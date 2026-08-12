import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";
const LoggedOutRoute = () => {
  const { authStatus } = useContext(AuthContext);

  // Show login/registration immediately; redirect only once we know the user is signed in.
  // Blocking on authStatus === "loading" made /login hang while stale tokens triggered /me + refresh.
  if (authStatus === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default LoggedOutRoute;
