import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    IconButton
  } from "@mui/material";
  import CloseIcon from "@mui/icons-material/Close";
  import { useEffect, useState } from "react";
  import { useForm, Controller } from "react-hook-form";
  import { yupResolver } from "@hookform/resolvers/yup";
  import * as yup from "yup";
import { CreateJobPost } from "../../services/jobPost-service";
import { GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
  
  interface JobPostFormProps {
    onClose: () => void;
    onSubmit?: (data: JobPostFormData) => void;
  }

  interface JobPostFormData {
    title: string;
    description: string;
    position: string;
    status: string;
    salary: number;
    startingDate: string;
    visibleUntil: string;
    restaurantLocationId: string;
  }
  
  const schema = yup.object({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
    position: yup.string().required("Position is required"),
    status: yup.string().required(),
    salary: yup.number().required().positive().integer(),
    startingDate: yup.string().required("Start date is required"),
    visibleUntil: yup.string().required("Visible until is required"),
    restaurantLocationId: yup.string().required("Location is required"),
  });
  
  const JobPostForm = ({ onClose, onSubmit }: JobPostFormProps) => {
    const [locations, setLocations] = useState<RestaurantLocation[]>([]);

    const {
      control,
      handleSubmit,
      formState: { errors }
    } = useForm({
      resolver: yupResolver(schema),
      defaultValues: {
        title: "",
        description: "",
        position: "",
        status: "Active",
        salary: 0,
        startingDate: "",
        visibleUntil: "",
        restaurantLocationId: ""
      }
    });

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
            visibleUntil: new Date(formData.visibleUntil),
          };
          try {
            await CreateJobPost(fixedData);
            onSubmit?.(formData);
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
          <Typography variant="h5">Create Job Post</Typography>
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
                label="Title"
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
                label="Description"
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
                label="Position"
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
                label="Status"
                fullWidth
                select
                margin="normal"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </TextField>
            )}
          />
  
          <Controller
            name="salary"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Salary"
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
                label="Starting Date"
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
                label="Visible Until"
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
                label="Restaurant Location"
                fullWidth
                select
                margin="normal"
                error={!!errors.restaurantLocationId}
                helperText={errors.restaurantLocationId?.message || (locations.length === 0 ? "No locations found for this brand." : "")}
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
            Create
          </Button>
        </form>
      </Box>
    );
  };
  
  export default JobPostForm;