import React, { useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Box, 
  CircularProgress 
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { LoginUserRequest } from "../../services/auth-service";
import { LoginUserDto } from "../../models/User.model";
import { AuthContext } from "../../store/Auth-context";

const schema = yup.object().shape({
    email: yup.string().email().required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const { setIsLoggedIn } = useContext(AuthContext);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserDto>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginUserDto) => {
    setLoading(true);
    try {
      const response = await LoginUserRequest(data);
      toast.success("Login successful!");
      console.log("Login Response:", response.data);
      localStorage.setItem("AccessToken", response.data.accessToken);
      localStorage.setItem("RefreshToken", response.data.refreshToken);
      setIsLoggedIn(true);

      navigate("/");
    } catch (error: any) {
      toast.error("Invalid username or password");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4} p={3} sx={{ border: "1px solid #ddd", borderRadius: 2 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="email"
                label="email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>
            <Button color="secondary" onClick={() => navigate("/registration")}>
              Don't have an account? Register
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;
