import { useContext, useEffect, useState } from "react";
import LoadingContext from "../store/Loading-context";
import { GetAllEmployers } from "../services/user-service";
import { Employer } from "../models/User.model";

export const useEmployers = () => {
    const [employers, setEmployers] = useState<Employer[]>([]);
    const { setLoading } = useContext(LoadingContext);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployers = async () => {
            setLoading(true);
            try {
                const response = await GetAllEmployers();
                setEmployers(response.data)
            } catch (err) {
                console.log("Greška prilikom preuzimanja poslodavaca.")
                setError("Greška prilikom preuzimanja poslodavaca.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployers();
    }, []);

    return { employers, error };
};
