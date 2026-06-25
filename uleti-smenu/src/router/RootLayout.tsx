import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppShell from "../components/Layout/AppShell";
import CandidateLayout from "../components/Layout/CandidateLayout/CandidateLayout";
import { AuthContext } from "../store/Auth-context";

const AUTH_PATH_PREFIXES = ["/login", "/registration"];

const RootLayout = () => {
  const location = useLocation();
  const { authStatus, role } = useContext(AuthContext);

  const isAuthPage = AUTH_PATH_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));
  const isEmployeeShell = authStatus === "authenticated" && role === "Employee";

  if (isAuthPage) {
    return <Outlet />;
  }

  if (isEmployeeShell) {
    return (
      <CandidateLayout>
        <Outlet />
      </CandidateLayout>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export default RootLayout;
