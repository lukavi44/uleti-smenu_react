import { useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../services/user-service";
import { MeResponse } from "../models/User.model";
import LoadingContext from "../store/Loading-context";
import { AuthContext } from "../store/Auth-context";

export const useMe = () => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const { setLoading } = useContext(LoadingContext);
  const {isLoggedIn} = useContext(AuthContext);

  const fetchMe = async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    try {
      const response = await getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMe();
  }, []);

  return { user };
};
