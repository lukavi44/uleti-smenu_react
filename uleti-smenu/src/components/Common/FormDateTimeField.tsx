import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/sr";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

type FormDateTimeFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  errorMessage?: string;
  clearable?: boolean;
};

const DATE_TIME_FORMAT = "DD.MM.YYYY HH:mm";

const parseDateTimeValue = (value?: string): Dayjs | null => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const FormDateTimeField = <T extends FieldValues>({
  name,
  control,
  label,
  errorMessage,
  clearable = false,
}: FormDateTimeFieldProps<T>) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    dayjs.locale(i18n.language === "sr" ? "sr" : "en");
  }, [i18n.language]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DateTimePicker
          label={label}
          value={parseDateTimeValue(field.value)}
          onChange={(value: Dayjs | null) => {
            field.onChange(value?.isValid() ? value.format("YYYY-MM-DDTHH:mm") : "");
          }}
          ampm={false}
          format={DATE_TIME_FORMAT}
          slotProps={{
            field: { clearable },
            textField: {
              fullWidth: true,
              margin: "normal",
              error: Boolean(errorMessage),
              helperText: errorMessage,
            },
            popper: {
              sx: {
                "& .MuiPaper-root": {
                  borderRadius: "12px",
                  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)",
                },
              },
            },
          }}
        />
      )}
    />
  );
};

export default FormDateTimeField;
