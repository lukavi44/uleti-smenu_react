const getApiBaseUrl = () => {
    const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (configuredBaseUrl && configuredBaseUrl.trim().length > 0) {
        return configuredBaseUrl.replace(/\/+$/, "");
    }
    return "https://localhost:7029";
};
export default getApiBaseUrl;