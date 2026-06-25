import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export type ShiftDatePreset = "any" | "today" | "tomorrow" | "week";

export type ShiftDateRange = {
  from?: Date;
  to?: Date;
};

export const resolveShiftDateRange = (
  preset: ShiftDatePreset,
  customDate: string
): ShiftDateRange => {
  if (customDate) {
    const selected = dayjs(customDate);
    if (!selected.isValid()) {
      return {};
    }

    return {
      from: selected.startOf("day").toDate(),
      to: selected.endOf("day").toDate(),
    };
  }

  switch (preset) {
    case "today":
      return {
        from: dayjs().startOf("day").toDate(),
        to: dayjs().endOf("day").toDate(),
      };
    case "tomorrow": {
      const tomorrow = dayjs().add(1, "day");
      return {
        from: tomorrow.startOf("day").toDate(),
        to: tomorrow.endOf("day").toDate(),
      };
    }
    case "week":
      return {
        from: dayjs().startOf("isoWeek").startOf("day").toDate(),
        to: dayjs().endOf("isoWeek").endOf("day").toDate(),
      };
    default:
      return {};
  }
};

export const isShiftDateFilterActive = (preset: ShiftDatePreset, customDate: string): boolean =>
  Boolean(customDate) || preset !== "any";
