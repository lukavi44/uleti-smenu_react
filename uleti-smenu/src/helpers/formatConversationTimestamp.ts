const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const formatConversationListTimestamp = (
  value: string | undefined,
  locale: string
): string => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const now = new Date();
  if (isSameDay(parsed, now)) {
    return parsed.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(parsed, yesterday)) {
    return locale.startsWith("sr") ? "Juče" : "Yesterday";
  }

  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6);
  if (parsed >= weekAgo) {
    return parsed.toLocaleDateString(locale, { weekday: "short" });
  }

  return parsed.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
};

export const formatChatDateSeparator = (value: string, locale: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatChatMessageTime = (value: string, locale: string): string =>
  new Date(value).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

export const isDifferentDay = (left: string, right: string): boolean => {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) {
    return true;
  }
  return !isSameDay(leftDate, rightDate);
};
