type RestaurantPathEmployer = {
  id: string;
  publicSlug?: string;
};

type RestaurantPathOptions = {
  myId?: string;
  role?: string;
};

export const getRestaurantProfilePath = (
  employer: RestaurantPathEmployer,
  options?: RestaurantPathOptions
): string => {
  const employerId = String(employer.id ?? "");
  const myId = options?.myId ?? "";
  const role = options?.role;

  if (role === "Employer" && myId && employerId && myId === employerId) {
    return "/profile";
  }

  const slug = employer.publicSlug?.trim();
  if (slug) {
    return `/restaurants/${slug}`;
  }

  return `/employers/${employerId}`;
};

export const getRestaurantReviewsPath = (employer: RestaurantPathEmployer): string => {
  const slug = employer.publicSlug?.trim();
  if (slug) {
    return `/restaurants/${slug}/reviews`;
  }

  return `/employers/${employer.id}/reviews`;
};
