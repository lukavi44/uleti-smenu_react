/** True when the browser still holds an access token (session may be resolving). */
export const hasStoredAccessToken = () => Boolean(localStorage.getItem("AccessToken"));
