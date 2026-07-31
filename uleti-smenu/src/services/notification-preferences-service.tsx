import axiosInstance from "./axiosConfig";

export interface NotificationPreferences {
  emailFavouriteJobPost: boolean;
  inAppFavouriteJobPost: boolean;
  inAppApplicationAccepted: boolean;
  inAppApplicationDeclined: boolean;
  inAppApplicationReceived: boolean;
  emailApplicationReceived: boolean;
  inAppReviewReminder: boolean;
}

type NotificationPreferencesApi = {
  emailFavouriteJobPost?: boolean;
  EmailFavouriteJobPost?: boolean;
  inAppFavouriteJobPost?: boolean;
  InAppFavouriteJobPost?: boolean;
  inAppApplicationAccepted?: boolean;
  InAppApplicationAccepted?: boolean;
  inAppApplicationDeclined?: boolean;
  InAppApplicationDeclined?: boolean;
  inAppApplicationReceived?: boolean;
  InAppApplicationReceived?: boolean;
  emailApplicationReceived?: boolean;
  EmailApplicationReceived?: boolean;
  inAppReviewReminder?: boolean;
  InAppReviewReminder?: boolean;
};

const normalizePreferences = (data: NotificationPreferencesApi): NotificationPreferences => ({
  emailFavouriteJobPost: Boolean(data.emailFavouriteJobPost ?? data.EmailFavouriteJobPost ?? true),
  inAppFavouriteJobPost: Boolean(data.inAppFavouriteJobPost ?? data.InAppFavouriteJobPost ?? true),
  inAppApplicationAccepted: Boolean(data.inAppApplicationAccepted ?? data.InAppApplicationAccepted ?? true),
  inAppApplicationDeclined: Boolean(data.inAppApplicationDeclined ?? data.InAppApplicationDeclined ?? true),
  inAppApplicationReceived: Boolean(data.inAppApplicationReceived ?? data.InAppApplicationReceived ?? true),
  emailApplicationReceived: Boolean(data.emailApplicationReceived ?? data.EmailApplicationReceived ?? true),
  inAppReviewReminder: Boolean(data.inAppReviewReminder ?? data.InAppReviewReminder ?? true),
});

const toApiPayload = (update: Partial<NotificationPreferences>) => ({
  emailFavouriteJobPost: update.emailFavouriteJobPost,
  inAppFavouriteJobPost: update.inAppFavouriteJobPost,
  inAppApplicationAccepted: update.inAppApplicationAccepted,
  inAppApplicationDeclined: update.inAppApplicationDeclined,
  inAppApplicationReceived: update.inAppApplicationReceived,
  emailApplicationReceived: update.emailApplicationReceived,
  inAppReviewReminder: update.inAppReviewReminder,
});

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await axiosInstance.get<NotificationPreferencesApi>("/api/v1/User/me/notification-preferences");
  return normalizePreferences(response.data);
};

export const updateNotificationPreferences = async (
  update: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> => {
  const response = await axiosInstance.patch<NotificationPreferencesApi>(
    "/api/v1/User/me/notification-preferences",
    toApiPayload(update),
  );
  return normalizePreferences(response.data);
};
