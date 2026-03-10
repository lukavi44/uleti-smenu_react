import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
  } from "react";
  import { Employer } from "../models/User.model";
  import { GetAllEmployers, PatchClientFavorite } from "../services/user-service";
import LoadingContext from "./Loading-context";
  
  interface UserContextType {
    employers: Employer[];
    setEmployers: Dispatch<SetStateAction<Employer[]>>;
    toggleFavoriteEmployer: (id: string) => Promise<void>;
    error: string | null;
  }
  
  const defaultContext: UserContextType = {
    employers: [],
    setEmployers: () => {},
    toggleFavoriteEmployer: async () => {},
    error: null,
  };
  
  export const UserContext = createContext<UserContextType>(defaultContext);
  
  export const UserContextProvider = ({ children }: { children: ReactNode }) => {
    const [employers, setEmployers] = useState<Employer[]>([]);
    const { setLoading } = useContext(LoadingContext);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchEmployers = async () => {
        setLoading(true);
        try {
          const response = await GetAllEmployers();
          setEmployers(response.data);
        } catch (err) {
          console.error("Error fetching employers", err);
          setError("Failed to load employers.");
        } finally {
            setLoading(false);
        }
      };
  
      fetchEmployers();
    }, []);
  
    const toggleFavoriteEmployer = async (id: string) => {
      try {
        await PatchClientFavorite(id);
        setEmployers((prev) =>
          prev.map((emp) =>
            emp.id === id ? { ...emp, isFavourite: !emp.isFavourite } : emp
          )
        );
      } catch (err) {
        console.error("Failed to toggle favorite", err);
      }
    };
  
    return (
      <UserContext.Provider
        value={{ employers, setEmployers, toggleFavoriteEmployer, error }}
      >
        {children}
      </UserContext.Provider>
    );
  };
  
  export default UserContextProvider;
  