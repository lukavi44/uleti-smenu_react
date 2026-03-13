import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    IconButton
  } from "@mui/material";
  import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useState } from "react";
  import { useForm, Controller } from "react-hook-form";
  import { yupResolver } from "@hookform/resolvers/yup";
  import * as yup from "yup";
import { CreateJobPost, UpdateMyJobPost } from "../../services/jobPost-service";
import { GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import { JobPost } from "../../models/JobPost.model";
import { useTranslation } from "react-i18next";
  
  interface JobPostFormProps {
    onClose: () => void;
    onSubmit?: () => void;
    initialData?: JobPost;
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

  const JobPostForm = ({ onClose, onSubmit, initialData }: JobPostFormProps) => {
    const { t } = useTranslation();
    const [locations, setLocations] = useState<RestaurantLocation[]>([]);
    const isEditMode = useMemo(() => !!initialData, [initialData]);
    const schema = yup.object({
      title: yup.string().required(t("jobPostForm.titleRequired")),
      description: yup.string().required(t("jobPostForm.descriptionRequired")),
      position: yup.string().required(t("jobPostForm.positionRequired")),
      status: yup.string().required(),
      salary: yup.number().required().positive().integer(),
      startingDate: yup.string().required(t("jobPostForm.startRequired")),
      visibleUntil: yup.string().optional(),
      restaurantLocationId: yup.string().required(t("jobPostForm.locationRequired")),
    });

    const defaultValues = useMemo(() => ({
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      position: initialData?.position ?? "",
      status: initialData?.status ?? "Active",
      salary: initialData?.salary ?? 0,
      startingDate: toDateTimeLocalValue(initialData?.startingDate),
      visibleUntil: toDateTimeLocalValue(initialData?.visibleUntil),
      restaurantLocationId: initialData?.restaurantLocationId ?? ""
    }), [initialData]);

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors }
    } = useForm({
      resolver: yupResolver(schema),
      defaultValues
    });

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

      loadLocations();
    }, []);
  
    const submitForm = async (formData: JobPostFormData) => {
        const fixedData = {
            ...formData,
            startingDate: new Date(formData.startingDate),
            visibleUntil: formData.visibleUntil ? new Date(formData.visibleUntil) : undefined,
          };
          try {
            if (isEditMode && initialData) {
              await UpdateMyJobPost(initialData.id, fixedData);
            } else {
              await CreateJobPost(fixedData);
            }
            onSubmit?.();
            onClose();
          }
          catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error('Unknown error', error);
            }
          }
    };
  
    return (
      <Box sx={{ padding: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{isEditMode ? t("jobPostForm.editTitle") : t("jobPostForm.createTitle")}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
  
        <form onSubmit={handleSubmit(submitForm)}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("jobPostForm.title")}
                fullWidth
                margin="normal"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />
  
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("jobPostForm.description")}
                fullWidth
                margin="normal"
                multiline
                minRows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
  
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("jobPostForm.position")}
                fullWidth
                margin="normal"
                error={!!errors.position}
                helperText={errors.position?.message}
              />
            )}
          />
  
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("jobPostForm.status")}
                fullWidth
                select
                margin="normal"
              >
                <MenuItem value="Active">{t("jobPostForm.statusActive")}</MenuItem>
                <MenuItem value="Expired">{t("jobPostForm.statusExpired")}</MenuItem>
                <MenuItem value="Cancelled">{t("jobPostForm.statusCancelled")}</MenuItem>
              </TextField>
            )}
          />
  
          <Controller
            name="salary"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("jobPostForm.salary")}
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.salary}
                helperText={errors.salary?.message}
              />
            )}
          />
  
          <Controller
            name="startingDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("jobPostForm.startingDate")}
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                fullWidth
                margin="normal"
                error={!!errors.startingDate}
                helperText={errors.startingDate?.message}
              />
            )}
          />

          <Controller
            name="visibleUntil"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("jobPostForm.visibleUntil")}
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                fullWidth
                margin="normal"
                error={!!errors.visibleUntil}
                helperText={errors.visibleUntil?.message}
              />
            )}
          />

          <Controller
            name="restaurantLocationId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("jobPostForm.restaurantLocation")}
                fullWidth
                select
                margin="normal"
                error={!!errors.restaurantLocationId}
                helperText={errors.restaurantLocationId?.message || (locations.length === 0 ? t("jobPostForm.noLocations") : "")}
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name} ({location.city})
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
  
          <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 3 }}>
            {isEditMode ? t("jobPostForm.saveChanges") : t("jobPostForm.create")}
          </Button>
        </form>
      </Box>
    );
  };
  
  export default JobPostForm;