import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";

export const useIsCandidateShell = (): boolean => {
  const { authStatus, role } = useContext(AuthContext);
  return authStatus === "authenticated" && role === "Employee";
};
