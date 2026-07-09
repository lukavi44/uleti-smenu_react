import axios from "axios";

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim().length > 0) {
      return responseData.trim();
    }

    if (responseData && typeof responseData === "object") {
      const record = responseData as Record<string, unknown>;

      if (typeof record.message === "string" && record.message.trim().length > 0) {
        return record.message.trim();
      }

      if (typeof record.title === "string" && record.title.trim().length > 0) {
        return record.title.trim();
      }

      const errors = record.errors;
      if (errors && typeof errors === "object") {
        const messages = Object.values(errors as Record<string, unknown>)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

        if (messages.length > 0) {
          return messages.join(" ");
        }
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }

  return fallback;
};
