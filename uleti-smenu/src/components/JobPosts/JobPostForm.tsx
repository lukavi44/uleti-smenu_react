import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CreateJobPost, UpdateMyJobPost } from "../../services/jobPost-service";
import { GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import { JobPost } from "../../models/JobPost.model";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../helpers/apiError";
import FormDateTimeField from "../Common/FormDateTimeField";
import styles from "./JobPostForm.module.scss";

interface JobPostFormProps {
  onClose: () => void;
  onSubmit?: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  initialData?: JobPost;
  embeddedInDrawer?: boolean;
  formId?: string;
}

interface JobPostFormData {
  title: string;
  description: string;
  position: string;
  status: string;
  salary: number;
  startingDate: string;
  visibleUntil?: string;
  restaurantLocationId: string;
}

const toDateTimeLocalValue = (value?: Date | string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const JobPostForm = ({
  onClose,
  onSubmit,
  onSubmittingChange,
  initialData,
  embeddedInDrawer = false,
  formId,
}: JobPostFormProps) => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<RestaurantLocation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(initialData?.id);

  const allowedStatuses = useMemo(() => {
    if (!isEditMode || embeddedInDrawer) {
      return ["Draft", "Active"] as const;
    }

    const statuses = ["Draft", "Active", "Expired", "Cancelled"];
    if (initialData?.status === "Completed") {
      statuses.push("Completed");
    }
    return statuses;
  }, [embeddedInDrawer, initialData?.status, isEditMode]);

  const schema = useMemo(() => {
    return yup.object({
      title: yup.string().required(t("jobPostForm.titleRequired")),
      description: yup
        .string()
        .required(t("jobPostForm.descriptionRequired"))
        .min(30, t("jobPostForm.descriptionMinLength")),
      position: yup.string().required(t("jobPostForm.positionRequired")),
      status: yup
        .string()
        .required()
        .oneOf([...allowedStatuses], t("jobPostForm.statusInvalid")),
      salary: yup
        .number()
        .typeError(t("jobPostForm.salaryRequired"))
        .required(t("jobPostForm.salaryRequired"))
        .moreThan(0, t("jobPostForm.salaryMin"))
        .integer(),
      startingDate: yup.string().required(t("jobPostForm.startRequired")),
      visibleUntil: yup.string().optional(),
      restaurantLocationId: yup.string().required(t("jobPostForm.locationRequired")),
    });
  }, [allowedStatuses, t]);

  const defaultValues = useMemo(
    () => ({
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      position: initialData?.position ?? "",
      status:
        initialData?.status && ["Draft", "Active"].includes(initialData.status)
          ? initialData.status
          : "Active",
      salary: initialData?.salary ?? 0,
      startingDate: toDateTimeLocalValue(initialData?.startingDate),
      visibleUntil: toDateTimeLocalValue(initialData?.visibleUntil),
      restaurantLocationId: initialData?.restaurantLocationId ?? "",
    }),
    [initialData]
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<JobPostFormData>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const statusValue = watch("status");

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await GetMyRestaurantLocations();
        setLocations(response.data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Unknown error", error);
        }
      }
    };

    void loadLocations();
  }, []);

  const getSubmitErrorMessage = (error: unknown) =>
    getApiErrorMessage(error, isEditMode ? t("jobPosts.saveError") : t("jobPostForm.createError"));

  const resolveVisibleUntil = (formData: JobPostFormData): Date | undefined => {
    if (formData.visibleUntil?.trim()) {
      const parsed = new Date(formData.visibleUntil);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    if (isEditMode && initialData?.visibleUntil) {
      const parsed = new Date(initialData.visibleUntil);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return undefined;
  };

  const resolveSubmitPayload = (formData: JobPostFormData) => ({
    title: formData.title,
    description: formData.description,
    position: formData.position,
    status: formData.status,
    salary: formData.salary,
    startingDate: new Date(formData.startingDate),
    visibleUntil: resolveVisibleUntil(formData),
    restaurantLocationId: formData.restaurantLocationId,
  });

  const submitForm = async (formData: JobPostFormData) => {
    if (isSubmitting) {
      return;
    }

    const fixedData = resolveSubmitPayload(formData);
    setIsSubmitting(true);
    onSubmittingChange?.(true);

    try {
      if (isEditMode && initialData) {
        await UpdateMyJobPost(initialData.id, fixedData);
        toast.success(t("jobPostForm.updateSuccess"));
        onSubmit?.();
        onClose();
      } else {
        await CreateJobPost(fixedData);
        toast.success(t("jobPostForm.createSuccess"));
        onSubmit?.();
        reset({
          title: "",
          description: "",
          position: "",
          status: "Active",
          salary: 0,
          startingDate: "",
          visibleUntil: "",
          restaurantLocationId: "",
        });
        if (embeddedInDrawer) {
          onClose();
        }
      }
    } catch (error: unknown) {
      const message = getSubmitErrorMessage(error);
      toast.error(message);
      console.error(message, error);
    } finally {
      setIsSubmitting(false);
      onSubmittingChange?.(false);
    }
  };

  const fieldClass = embeddedInDrawer ? `${styles.drawerField} ${styles.field}` : styles.field;

  const renderLabel = (label: string, required = false) => (
    <span className={styles.label}>
      <span>{label}</span>
      {required ? <span className={styles.required}> *</span> : null}
    </span>
  );

  const getStatusMenuLabel = (status: string) => {
    switch (status) {
      case "Draft":
        return t("jobPostForm.statusDraft");
      case "Active":
        return t("jobPostForm.statusActive");
      case "Expired":
        return t("jobPostForm.statusExpired");
      case "Cancelled":
        return t("jobPostForm.statusCancelled");
      case "Completed":
        return t("jobPostForm.statusCompleted");
      default:
        return status;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className={`${styles.formRoot} ${embeddedInDrawer ? styles.formRootDrawer : ""}`}>
        {!embeddedInDrawer ? (
          <Box className={styles.formHeader} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{isEditMode ? t("jobPostForm.editTitle") : t("jobPostForm.createTitle")}</Typography>
            <IconButton onClick={onClose} aria-label={t("common.close")} className={styles.closeButton} size="large">
              <CloseIcon />
            </IconButton>
          </Box>
        ) : null}

        <Box
          component="form"
          id={formId}
          className={styles.formContent}
          onSubmit={handleSubmit(submitForm)}
        >
          <Box className={`${styles.formBody} ${embeddedInDrawer ? styles.formBodyDrawer : ""}`}>
            <div className={fieldClass}>
              {embeddedInDrawer
                ? renderLabel(t("jobPostForm.titleLabel"), true)
                : null}
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={embeddedInDrawer ? undefined : t("jobPostForm.title")}
                    placeholder={embeddedInDrawer ? t("jobPostForm.titlePlaceholder") : undefined}
                    fullWidth
                    margin={embeddedInDrawer ? "none" : "normal"}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </div>

            <div className={fieldClass}>
              {embeddedInDrawer
                ? renderLabel(t("jobPostForm.descriptionLabel"), true)
                : null}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={embeddedInDrawer ? undefined : t("jobPostForm.description")}
                    placeholder={embeddedInDrawer ? t("jobPostForm.descriptionPlaceholder") : undefined}
                    fullWidth
                    margin={embeddedInDrawer ? "none" : "normal"}
                    multiline
                    minRows={embeddedInDrawer ? 4 : 3}
                    error={!!errors.description}
                    helperText={
                      errors.description?.message ||
                      (embeddedInDrawer ? t("jobPostForm.descriptionMinHint") : undefined)
                    }
                  />
                )}
              />
            </div>

            <div className={fieldClass}>
              {embeddedInDrawer ? renderLabel(t("jobPostForm.positionLabel"), true) : null}
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={embeddedInDrawer ? undefined : t("jobPostForm.position")}
                    placeholder={embeddedInDrawer ? t("jobPostForm.positionPlaceholder") : undefined}
                    fullWidth
                    margin={embeddedInDrawer ? "none" : "normal"}
                    error={!!errors.position}
                    helperText={errors.position?.message}
                  />
                )}
              />
            </div>

            <div className={fieldClass}>
              {embeddedInDrawer ? renderLabel(t("jobPostForm.locationLabel"), true) : null}
              <Controller
                name="restaurantLocationId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={embeddedInDrawer ? undefined : t("jobPostForm.restaurantLocation")}
                    placeholder={embeddedInDrawer ? t("jobPostForm.locationPlaceholder") : undefined}
                    fullWidth
                    select
                    margin={embeddedInDrawer ? "none" : "normal"}
                    error={!!errors.restaurantLocationId}
                    helperText={
                      errors.restaurantLocationId?.message ||
                      (locations.length === 0 ? (
                        <span>
                          {t("jobPostForm.noLocations")}{" "}
                          <Link to="/profile#employer-branches" onClick={onClose}>
                            {t("profile.employerManage.manageBranches")}
                          </Link>
                        </span>
                      ) : (
                        ""
                      ))
                    }
                    slotProps={{
                      input: embeddedInDrawer
                        ? {
                            startAdornment: (
                              <InputAdornment position="start">
                                <MapPinIcon className={styles.locationIcon} aria-hidden />
                              </InputAdornment>
                            ),
                          }
                        : undefined,
                    }}
                  >
                    {locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name} ({location.city})
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </div>

            <div className={fieldClass}>
              {embeddedInDrawer ? renderLabel(t("jobPostForm.statusLabel"), true) : null}
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={embeddedInDrawer ? undefined : t("jobPostForm.status")}
                    fullWidth
                    select
                    margin={embeddedInDrawer ? "none" : "normal"}
                  >
                    {allowedStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status === "Active" || status === "Draft" ? (
                          <span className={styles.statusOption}>
                            <span
                              className={status === "Active" ? styles.statusDot : styles.statusDotDraft}
                              aria-hidden
                            />
                            {getStatusMenuLabel(status)}
                          </span>
                        ) : (
                          getStatusMenuLabel(status)
                        )}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              {embeddedInDrawer && statusValue === "Active" ? (
                <p className={styles.statusHint}>{t("jobPostForm.statusActiveHint")}</p>
              ) : null}
              {embeddedInDrawer && statusValue === "Draft" ? (
                <p className={styles.statusHint}>{t("jobPostForm.statusDraftHint")}</p>
              ) : null}
            </div>

            <div className={fieldClass}>
              {embeddedInDrawer ? renderLabel(t("jobPostForm.salaryLabel"), true) : null}
              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value === 0 && embeddedInDrawer ? "" : field.value}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      field.onChange(nextValue === "" ? 0 : Number(nextValue));
                    }}
                    label={embeddedInDrawer ? undefined : t("jobPostForm.salary")}
                    type="number"
                    fullWidth
                    margin={embeddedInDrawer ? "none" : "normal"}
                    error={!!errors.salary}
                    helperText={errors.salary?.message}
                    slotProps={{
                      input: embeddedInDrawer
                        ? {
                            endAdornment: <InputAdornment position="end">RSD</InputAdornment>,
                          }
                        : undefined,
                    }}
                  />
                )}
              />
            </div>

            <div className={`${fieldClass} ${styles.dateField}`}>
              {embeddedInDrawer ? renderLabel(t("jobPostForm.startingDateLabel"), true) : null}
              <FormDateTimeField
                name="startingDate"
                control={control}
                label={t("jobPostForm.startingDate")}
                placeholder={t("jobPostForm.startingDatePlaceholder")}
                hideLabel={embeddedInDrawer}
                errorMessage={errors.startingDate?.message}
              />
            </div>

            {!embeddedInDrawer ? (
              <>
                <FormDateTimeField
                  name="visibleUntil"
                  control={control}
                  label={t("jobPostForm.visibleUntil")}
                  errorMessage={errors.visibleUntil?.message}
                  clearable
                />
              </>
            ) : null}
          </Box>

          {!embeddedInDrawer ? (
            <Box className={styles.formActions}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("common.loading")
                  : isEditMode
                    ? t("jobPostForm.saveChanges")
                    : t("jobPostForm.create")}
              </Button>
            </Box>
          ) : null}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default JobPostForm;
