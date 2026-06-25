export const isChatDetailPath = (pathname: string): boolean =>
  /^\/messages\/[^/]+$/.test(pathname);
