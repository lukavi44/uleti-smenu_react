import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { LogoutUserRequest } from "../services/auth-service";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, GetCurrentUserRole } from "../services/user-service";
import { MeResponse } from "../models/User.model";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
    isLoggedIn: boolean;
    authStatus: AuthStatus;
    logout: () => Promise<void>;
    refreshAuthState: () => Promise<void>;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    setAuthStatus: Dispatch<SetStateAction<AuthStatus>>;
    role: string | null;
    me: MeResponse | undefined;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    authStatus: "loading",
    logout: async () => { },
    refreshAuthState: async () => { },
    setIsLoggedIn: () => { },
    setAuthStatus: () => { },
    role: null,
    me: undefined,
});

interface AuthContextProviderProps {
    children: ReactNode;
}

const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
    const [role, setRole] = useState<string | null>(null);
    const [me, setMe] = useState<MeResponse | undefined>();
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await LogoutUserRequest();
        } catch {
            // Local logout should still proceed if backend logout fails.
        }
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("RefreshToken");
        setIsLoggedIn(false);
        setAuthStatus("unauthenticated");
        setRole(null);
        setMe(undefined);
        navigate("/login");
    };

    const refreshAuthState = async () => {
        const token = localStorage.getItem("AccessToken");

        setAuthStatus("loading");
        if (!token) {
            setIsLoggedIn(false);
            setAuthStatus("unauthenticated");
            setRole(null);
            setMe(undefined);
            return;
        }

        try {
            const [roleResponse, meResponse] = await Promise.all([GetCurrentUserRole(), getCurrentUser()]);

            setIsLoggedIn(true);
            setAuthStatus("authenticated");
            setRole(roleResponse.data);
            setMe(meResponse.data);
        } catch (error) {
            console.error("AuthContext init failed:", error);
            localStorage.removeItem("AccessToken");
            localStorage.removeItem("RefreshToken");
            setIsLoggedIn(false);
            setAuthStatus("unauthenticated");
            setRole(null);
            setMe(undefined);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            await refreshAuthState();
        };

        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, authStatus, refreshAuthState, setIsLoggedIn, setAuthStatus, logout, role, me }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;