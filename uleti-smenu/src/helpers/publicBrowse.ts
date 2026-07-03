const PUBLIC_AUTH_PATH_PREFIXES = ["/login", "/registration", "/forgot-password", "/reset-password"];

export const isPublicAuthPath = (pathname: string) =>
  PUBLIC_AUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

/** Routes that unauthenticated visitors may browse without a login redirect. */
export const isPublicBrowsePath = (pathname: string) =>
  pathname === "/" ||
  pathname === "/oglasi-za-posao" ||
  pathname.startsWith("/oglasi-za-posao/") ||
  pathname.startsWith("/restaurants") ||
  pathname === "/about" ||
  pathname === "/how-it-works" ||
  pathname === "/faq" ||
  pathname === "/for-candidates" ||
  pathname === "/za-kandidate" ||
  pathname === "/za-restorane" ||
  pathname === "/for-employers" ||
  pathname === "/pravno" ||
  pathname.startsWith("/terms") ||
  pathname.startsWith("/privacy") ||
  pathname.startsWith("/cookies");
