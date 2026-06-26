export const isEmployerJobPostDetailPath = (pathname: string): boolean =>
  /^\/oglasi-za-posao\/[^/]+$/.test(pathname);
