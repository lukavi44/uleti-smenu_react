import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/Auth-context";
import LoadingContext from "../store/Loading-context";

const RequireAuth = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const { isLoading } = useContext(LoadingContext);
  
    if (isLoading) return <div>Loading...</div>; 
  
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
  };
  

export default RequireAuth;
