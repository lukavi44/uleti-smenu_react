export const isEmployerCandidateDetailPath = (pathname: string): boolean =>
  /^\/employees\/[^/]+$/.test(pathname);
