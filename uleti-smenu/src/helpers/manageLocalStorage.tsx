const accessTokenKey = "accessToken";
const refreshTokenKey = "refreshToken";
const expirationKey = "expiration";

export const deleteLocalStorage = () => {
    localStorage.removeItem(accessTokenKey);
    localStorage.removeItem(refreshTokenKey);
    localStorage.removeItem(expirationKey);
  };