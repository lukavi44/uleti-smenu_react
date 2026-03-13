import { useContext, useEffect, useState } from "react";
import LoadingContext from "../store/Loading-context";
import { GetAllEmployers, GetEmployersWithFavouriteStatus } from "../services/user-service";
import { Employer } from "../models/User.model";
import { AuthContext } from "../store/Auth-context";

export const useEmployers = () => {
    const [employers, setEmployers] = useState<Employer[]>([]);
    const { setLoading } = useContext(LoadingContext);
    const { authStatus, role } = useContext(AuthContext);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployers = async () => {
            setLoading(true);
            try {
                const isEmployeeView = authStatus === "authenticated" && role === "Employee";
                const response = isEmployeeView
                    ? await GetEmployersWithFavouriteStatus()
                    : await GetAllEmployers();

                const normalizedEmployers = response.data.map((employer) => ({
                    ...employer,
                    isFavourite: Boolean(employer.isFavourite)
                }));

                setEmployers(normalizedEmployers);
            } catch (err) {
                console.log("Greška prilikom preuzimanja poslodavaca.")
                setError("Greška prilikom preuzimanja poslodavaca.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployers();
    }, [authStatus, role, setLoading]);

    return { employers, error };
};
