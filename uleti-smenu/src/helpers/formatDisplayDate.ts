export const formatDisplayDate = (value?: string): string => {
  if (!value) {
    return "";
  }

  const isoDate = value.includes("T") ? value.split("T")[0] : value.slice(0, 10);
  const [year, month, day] = isoDate.split("-");

  if (!year || !month || !day) {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const dd = String(parsedDate.getDate()).padStart(2, "0");
    const mm = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const yyyy = parsedDate.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
};
