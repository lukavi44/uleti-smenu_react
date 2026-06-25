import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";

export const useIsEmployerShell = (): boolean => {
  const { authStatus, role } = useContext(AuthContext);
  return authStatus === "authenticated" && role === "Employer";
};
