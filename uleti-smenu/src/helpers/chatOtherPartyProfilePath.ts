import { ChatConversation } from "../models/Chat.model";
import { getRestaurantProfilePath } from "./restaurantPaths";

/**
 * Profile path for the other participant in a chat conversation.
 * - Candidate → restaurant public page (`/restaurants/:slug` or legacy id fallback)
 * - Employer → candidate public page (`/employees/:id`)
 */
export const getChatOtherPartyProfilePath = (
  conversation: Pick<ChatConversation, "otherPartyId" | "otherPartyPublicSlug">,
  role?: string | null
): string | undefined => {
  const otherPartyId = conversation.otherPartyId?.trim();
  if (!otherPartyId) {
    return undefined;
  }

  if (role === "Employee") {
    return getRestaurantProfilePath({
      id: otherPartyId,
      publicSlug: conversation.otherPartyPublicSlug,
    });
  }

  if (role === "Employer") {
    return `/employees/${otherPartyId}`;
  }

  // Fallback when role is unknown: prefer restaurant slug, else employee id path.
  if (conversation.otherPartyPublicSlug?.trim()) {
    return getRestaurantProfilePath({
      id: otherPartyId,
      publicSlug: conversation.otherPartyPublicSlug,
    });
  }

  return `/employees/${otherPartyId}`;
};
