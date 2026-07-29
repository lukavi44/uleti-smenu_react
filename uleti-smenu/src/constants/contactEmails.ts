/** Canonical public contact addresses for UletiSmenu (Zoho Mail). */
export const CONTACT_EMAILS = {
  support: "support@uletismenu.com",
  info: "info@uletismenu.com",
  privacy: "privacy@uletismenu.com",
  legal: "legal@uletismenu.com",
  noreply: "noreply@uletismenu.com",
} as const;

export const mailto = (email: string) => `mailto:${email}`;
