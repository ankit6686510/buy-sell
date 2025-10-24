import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Stack,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  LoginRounded,
  Google,
  GitHub,
  Apple,
  CheckCircle,
  Security,
  Speed,
  ErrorOutline
} from '@mui/icons-material';

import { loginStart, login, loginFailure } from '../store/slices/authSlice';
import { login as loginService } from '../services/authService';
import GlassCard from '../components/modern/GlassCard';
import GradientButton from '../components/modern/GradientButton';
import { gradients, animations } from '../theme';


// ✅ Strong validation schema (merged best version)
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address, e.g., user@example.com')
    .required('Email is required to log in'),
  password: Yup.string()
    .min(6, 'Your password must have at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Enter your account password'),
});


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { loading, error } = useSelector((state) => state.auth);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // Optional: dispatch(resetAuthError()) if implemented
  }, [dispatch]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      dispatch(loginStart());
      const data = await loginService(values);
      dispatch(login(data));

      setSnackbarMessage('Login successful! Redirecting...');
      setShowSnackbar(true);

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnackbarClose = () => setShowSnackbar(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const socialProviders = [
    { name: 'Google', icon: Google, color: '#4285f4' },
    { name: 'GitHub', icon: GitHub, color: isDark ? theme.palette.text.primary : '#333' },
    { name: 'Apple', icon: Apple, color: isDark ? theme.palette.common.white : '#000' },
  ];

  const benefits = [
    { icon: CheckCircle, text: "94% Success Rate", colorKey: "success" },
    { icon: Security, text: "Verified & Secure", colorKey: "primary" },
    { icon: Speed, text: "Quick Matching", colorKey: "secondary" },
  ];

  const darkBgColor = theme.palette.background.default;
  const darkPaperColor = theme.palette.background.paper;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${darkBgColor} 0%, ${alpha(darkBgColor, 0.8)} 50%, #1a1a2e 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(theme.palette.secondary.main, isDark ? 0.08 : 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(theme.palette.primary.light, isDark ? 0.08 : 0.15)} 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Container component="main" maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">

          {/* Left Side - Info */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ animation: animations.slideInUp }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome Back!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Sign in to continue your earbud matching journey.
              </Typography>
              <Stack spacing={3}>
                {benefits.map((benefit, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette[benefit.colorKey].main, 0.2)} 0%, ${alpha(theme.palette[benefit.colorKey].main, 0.4)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <benefit.icon sx={{ color: `${benefit.colorKey}.main`, fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {benefit.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <GlassCard sx={{ p: 4, maxWidth: 480, mx: 'auto' }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Sign In
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Access your account to continue matching
                </Typography>
              </Box>

              {/* Social Logins */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                {socialProviders.map((provider) => (
                  <Button
                    key={provider.name}
                    variant="outlined"
                    fullWidth
                    startIcon={<provider.icon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      borderColor: alpha(provider.color, 0.3),
                      color: provider.color,
                      backgroundColor: alpha(provider.color, 0.05),
                      '&:hover': {
                        borderColor: alpha(provider.color, 0.5),
                        backgroundColor: alpha(provider.color, 0.1),
                      },
                    }}
                  >
                    Continue with {provider.name}
                  </Button>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <Divider sx={{ flex: 1, borderColor: alpha(theme.palette.divider, 0.5) }} />
                <Chip label="Or continue with email" size="small" sx={{ mx: 2 }} />
                <Divider sx={{ flex: 1, borderColor: alpha(theme.palette.divider, 0.5) }} />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Formik Form */}
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form style={{ width: '100%' }}>
                    <Stack spacing={3}>
                      <Field
                        as={TextField}
                        fullWidth
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        InputProps={{
                          startAdornment: <Email sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: alpha(darkPaperColor, 0.8),
                          },
                        }}
                      />

                      <Field
                        as={TextField}
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        InputProps={{
                          startAdornment: <Lock sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />,
                          endAdornment: (
                            <IconButton onClick={togglePasswordVisibility} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: alpha(darkPaperColor, 0.8),
                          },
                        }}
                      />
                    </Stack>

                    <Box sx={{ textAlign: 'right', mt: 2 }}>
                      <Link
                        component={RouterLink}
                        to="/forgot-password"
                        sx={{ color: 'primary.light', fontWeight: 500 }}
                      >
                        Forgot password?
                      </Link>
                    </Box>

                    <GradientButton
                      type="submit"
                      fullWidth
                      size="large"
                      disabled={loading || isSubmitting}
                      startIcon={!loading && <LoginRounded />}
                      sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </GradientButton>
                  </Form>
                )}
              </Formik>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Don’t have an account?{' '}
                  <Link component={RouterLink} to="/register" sx={{ color: 'primary.light', fontWeight: 600 }}>
                    Create one now
                  </Link>
                </Typography>
              </Box>
            </GlassCard>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
