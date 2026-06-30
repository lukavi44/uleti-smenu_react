import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CandidateLayout from "../components/Layout/CandidateLayout/CandidateLayout";
import EmployerLayout from "../components/Layout/EmployerLayout/EmployerLayout";
import AdminLayout from "../components/Layout/AdminLayout/AdminLayout";
import GuestLayout from "../components/Layout/GuestLayout/GuestLayout";
import { AuthContext } from "../store/Auth-context";

const AUTH_PATH_PREFIXES = ["/login", "/registration"];

const RootLayout = () => {
  const location = useLocation();
  const { authStatus, role } = useContext(AuthContext);

  const isAuthPage = AUTH_PATH_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));
  const isEmployeeShell = authStatus === "authenticated" && role === "Employee";
  const isEmployerShell = authStatus === "authenticated" && role === "Employer";
  const isAdminShell = authStatus === "authenticated" && role === "Admin";
  const useGuestLayout = authStatus !== "authenticated" && !isAuthPage;

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

  if (isEmployerShell) {
    return (
      <EmployerLayout>
        <Outlet />
      </EmployerLayout>
    );
  }

  if (isAdminShell) {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    );
  }

  if (useGuestLayout) {
    return (
      <GuestLayout>
        <Outlet />
      </GuestLayout>
    );
  }

  return <Outlet />;
};

export default RootLayout;
