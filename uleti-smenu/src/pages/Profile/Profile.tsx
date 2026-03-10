import { useContext } from "react";
import { AuthContext } from "../../store/Auth-context";
import EmployerProfile from "./EmployerProfile";
import { Employee, Employer } from "../../models/User.model";
import EmployeeProfile from "./EmployeeProfile";

const ProfilePage = () => {
  const { role, me, authStatus } = useContext(AuthContext);

  if (authStatus === "loading") return <div>Loading profile...</div>;
  if (authStatus === "unauthenticated") return <div>Unauthorized</div>;
  if (!me) return <div>Loading profile...</div>;

  switch (role) {
    case "Employer":
      return <EmployerProfile user={me as Employer} />;
    case "Employee":
      return <EmployeeProfile user={me as Employee} />;
    // case "Admin":
    //   return <AdminProfile user={user} />;
    default:
      return <div>Unknown role</div>;
  }
};

export default ProfilePage;