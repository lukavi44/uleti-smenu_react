const getApiBaseUrl = () => {
    const hostname = window.location.hostname;

    if (hostname.includes("dev")) {
        return process.env.BASE_URL;
    } 
    else if (hostname.includes("localhost")) {
        return "https://localhost:7029/";
    }
};
export default getApiBaseUrl;