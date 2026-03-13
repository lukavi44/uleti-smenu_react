import { useContext } from "react";
import { AuthContext } from "../../store/Auth-context";
import EmployerProfile from "./EmployerProfile";
import { Employee, Employer } from "../../models/User.model";
import EmployeeProfile from "./EmployeeProfile";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { role, me, authStatus } = useContext(AuthContext);

  if (authStatus === "loading") return <div>{t("profile.loadingProfile")}</div>;
  if (authStatus === "unauthenticated") return <div>{t("common.unauthorized")}</div>;
  if (!me) return <div>{t("profile.loadingProfile")}</div>;

  switch (role) {
    case "Employer":
      return <EmployerProfile user={me as Employer} />;
    case "Employee":
      return <EmployeeProfile user={me as Employee} />;
    // case "Admin":
    //   return <AdminProfile user={user} />;
    default:
      return <div>{t("common.unknownRole")}</div>;
  }
};

export default ProfilePage;