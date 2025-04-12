import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { LogoutUserRequest } from "../services/auth-service";
import LoadingContext from "./Loading-context";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    isLoggedIn: boolean;
    logout: (e: React.MouseEvent<HTMLButtonElement>) => void;
    setIsLoggedIn: Dispatch<SetStateAction<any>>;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    logout: () => { },
    setIsLoggedIn: () => { },
});

interface AuthContextProviderProps {
    children: ReactNode;
}

const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const { setLoading, isLoading } = useContext(LoadingContext);

    const navigate = useNavigate();

    const logout = () => {
        LogoutUserRequest();
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("RefreshToken");
        setIsLoggedIn(false);
        navigate('/login');
    };

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem("AccessToken");
        setIsLoggedIn(!!token);
        /*localStorage.getItem(...) vraća string ili null
        !!token konvertuje: null → false
        "neki_token_string" → true
        setIsLoggedIn(...) odmah dobija tačnu boolean vrednost */
        setLoading(false);

        // flash of unauthenticated content 
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, logout }}>
          {children}
        </AuthContext.Provider>
      );
}

export default AuthContextProvider;