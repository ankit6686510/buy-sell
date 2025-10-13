import { useState } from 'react';
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
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  LocationOn,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Google,
  GitHub,
  Apple,
  CheckCircle,
  Security,
  Group,
  Verified,
  ErrorOutline
} from '@mui/icons-material';
import { IconButton } from '@mui/material';

import { loginStart, login, loginFailure } from '../store/slices/authSlice';
import { register } from '../services/authService';
import GlassCard from '../components/modern/GlassCard';
import GradientButton from '../components/modern/GradientButton';
import { gradients, animations } from '../theme';

const validationSchema = Yup.object({
  name: Yup.string().required('Please enter your full name to continue'),
  email: Yup.string().email('That doesn’t look like a valid email address').required('We need your email to verify your account'),
  password: Yup.string().min(6, 'Your password must have at least 6 characters').required('Please create a password'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords do not match').required('Please confirm your password'),
  location: Yup.string().required('Please enter your city or district'),
  agreeToTerms: Yup.boolean().oneOf([true], 'Please accept our terms to create an account'),

});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { loading, error } = useSelector((state) => state.auth);
  const [registerError, setRegisterError] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (values, { setSubmitting }) => {
    setRegisterError(null);
    try {
      dispatch(loginStart());
      const { confirmPassword, agreeToTerms, ...userData } = values;
      const data = await register(userData);
      dispatch(login(data));
      setSnackbarMessage('Account created successfully!');
      setShowSnackbar(true);

      // Short delay before navigation for better UX
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      setRegisterError(err.message || 'Registration failed');
      dispatch(loginFailure(err.message || 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const socialProviders = [
    { name: 'Google', icon: Google, color: '#4285f4' },
    { name: 'GitHub', icon: GitHub, color: '#333' },
    { name: 'Apple', icon: Apple, color: '#000' },
  ];

  const benefits = [
    { icon: Group, text: "Join 8,500+ Users", color: "primary.main" },
    { icon: Security, text: "Verified & Secure", color: "success.main" },
    { icon: CheckCircle, text: "Free to Start", color: "secondary.main" },
  ];

  const features = [
    "✓ Smart AI-powered matching algorithm",
    "✓ Secure messaging with verified users",
    "✓ Real-time notifications for new matches",
    "✓ Multi-level verification system",
    "✓ 94% success rate in finding matches",
    "✓ Free to create listings and browse"
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.secondary.main}10 0%, ${theme.palette.primary.main}10 100%)`,
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
            radial-gradient(circle at 30% 20%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, ${alpha(theme.palette.secondary.light, 0.15)} 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Container component="main" maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Benefits */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ animation: animations.slideInUp, animationDelay: '0.1s', animationFillMode: 'both' }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: gradients.secondary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                }}
              >
                Join SecondMarket
              </Typography>

              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                Create your account and start connecting with verified users to find your perfect earbud match today.
              </Typography>

              <Stack spacing={3} sx={{ mb: 4 }}>
                {benefits.map((benefit, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      animation: animations.slideInUp,
                      animationDelay: `${0.2 + (index * 0.1)}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${benefit.color}20 0%, ${benefit.color}40 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <benefit.icon sx={{ color: benefit.color, fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {benefit.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                  What you get:
                </Typography>
                <Stack spacing={1}>
                  {features.map((feature, index) => (
                    <Typography
                      key={index}
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        animation: animations.slideInUp,
                        animationDelay: `${0.4 + (index * 0.05)}s`,
                        animationFillMode: 'both'
                      }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 3 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  "Signing up was quick and easy. Found my match within 3 days!"
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: 'secondary.main' }}>
                  - Michael Rodriguez, Power User
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Registration Form */}
          <Grid item xs={12} md={6}>
            <GlassCard
              sx={{
                p: { xs: 3, sm: 4 },
                maxWidth: 500,
                mx: 'auto',
                animation: animations.slideInUp,
                animationDelay: '0.3s',
                animationFillMode: 'both'
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: gradients.secondary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Get Started
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create your free account in under 2 minutes
                </Typography>
              </Box>

              {/* Social Registration Buttons */}
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
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: alpha(provider.color, 0.5),
                        backgroundColor: alpha(provider.color, 0.1),
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Sign up with {provider.name}
                  </Button>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <Divider sx={{ flex: 1 }} />
                <Chip label="Or create with email" size="small" sx={{ mx: 2 }} />
                <Divider sx={{ flex: 1 }} />
              </Box>

              {registerError && (
                <Alert
                  role='alert'
                  aria-label='registration error'
                  aria-live='assertive'
                  severity="error"
                  sx={{
                    width: '100%',
                    mb: 3,
                    borderRadius: 2,
                    animation: animations.slideInUp
                  }}
                >
                  {registerError}
                </Alert>
              )}

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  location: '',
                  agreeToTerms: false
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                  <Form style={{ width: '100%' }}>
                    <Stack spacing={3}>
                      <Field
                        as={TextField}
                        variant="outlined"
                        fullWidth
                        id="name"
                        label="Full Name"
                        name="name"
                        autoComplete="name"
                        error={touched.name && Boolean(errors.name)}
                        helperText={
                          touched.name && errors.name && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <ErrorOutline color="error" fontSize="small" />
                              <Typography variant="caption" color="error" role="alert" aria-live="assertive">
                                {errors.name}
                              </Typography>
                            </Box>

                          )
                        }
                        InputProps={{
                          startAdornment: (
                            <Person sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.background.paper, 1),
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            },
                          },
                        }}
                      />

                      <Field
                        as={TextField}
                        variant="outlined"
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        error={touched.email && Boolean(errors.email)}
                        helperText={
                          touched.email && errors.email ? (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <ErrorOutline color="error" fontSize="small" />
                              <Typography variant="caption" color="error" role="alert" aria-live="assertive">
                                {errors.email}
                              </Typography>
                            </Box>
                          ) : (
                            values.email && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Typography variant="caption" color={/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email) ? 'success.main' : 'warning.main'}>
                                  {/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email) ? 'Valid email address' : 'Enter a valid email address'}
                                </Typography>
                              </Box>
                            )
                          )
                        }
                        InputProps={{
                          startAdornment: (
                            <Email sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.background.paper, 1),
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            },
                          },
                        }}
                      />

                      <Field
                        as={TextField}
                        variant="outlined"
                        fullWidth
                        id="location"
                        label="Location (City, State)"
                        name="location"
                        autoComplete="address-level2"
                        error={touched.location && Boolean(errors.location)}
                        helperText={touched.location && errors.location && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <ErrorOutline color="error" fontSize="small" />
                            <Typography variant="caption" color="error" role="alert" aria-live="assertive">
                              {errors.location}
                            </Typography>
                          </Box>
                        )}
                        InputProps={{
                          startAdornment: (
                            <LocationOn sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.background.paper, 1),
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            },
                          },
                        }}
                      />

                      <Field
                        as={TextField}
                        variant="outlined"
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="new-password"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password ? (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <ErrorOutline color="error" fontSize="small" />
                            <Typography variant="caption" color="error" role="alert" aria-live="assertive">
                              {errors.password}
                            </Typography>
                          </Box>
                        ) : (
                          values.password && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Typography variant="caption" color={values.password.length < 6 ? 'error.main' : /[A-Z]/.test(values.password) && /[a-z]/.test(values.password) && /[0-9]/.test(values.password) && /[^A-Za-z0-9]/.test(values.password) ? 'success.main' : 'warning.main'}>
                                Password strength: {values.password.length < 6 ? 'Weak' : /[A-Z]/.test(values.password) && /[a-z]/.test(values.password) && /[0-9]/.test(values.password) && /[^A-Za-z0-9]/.test(values.password) ? 'Strong' : 'Medium'}
                              </Typography>
                            </Box>
                          )
                        )}
                        InputProps={{
                          startAdornment: (
                            <Lock sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />
                          ),
                          endAdornment: (
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                              sx={{ mr: 1 }}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.background.paper, 1),
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            },
                          },
                        }}
                      />

                      <Field
                        as={TextField}
                        variant="outlined"
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <ErrorOutline color="error" fontSize="small" />
                            <Typography variant="caption" color="error" role="alert" aria-live="assertive">
                              {errors.confirmPassword}
                            </Typography>
                          </Box>
                        )}
                        InputProps={{
                          startAdornment: (
                            <Lock sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />
                          ),
                          endAdornment: (
                            <IconButton
                              onClick={toggleConfirmPasswordVisibility}
                              edge="end"
                              sx={{ mr: 1 }}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.background.paper, 1),
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            },
                          },
                        }}
                      />
                    </Stack>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.agreeToTerms}
                          onChange={(e) => setFieldValue('agreeToTerms', e.target.checked)}
                          color="primary"
                          sx={{ color: touched.agreeToTerms && errors.agreeToTerms ? 'error.main' : 'inherit' }}
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          I agree to the{' '}
                          <Link href="/terms" target="_blank" sx={{ color: 'primary.main' }}>
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" target="_blank" sx={{ color: 'primary.main' }}>
                            Privacy Policy
                          </Link>
                        </Typography>
                      }
                      sx={{ mt: 2, alignItems: 'flex-start' }}
                    />

                    {touched.agreeToTerms && errors.agreeToTerms && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.agreeToTerms}
                      </Typography>
                    )}

                    <GradientButton
                      type="submit"
                      fullWidth
                      size="large"
                      disabled={loading || isSubmitting}
                      startIcon={loading ? undefined : <PersonAdd />}
                      sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                    </GradientButton>
                  </Form>
                )}
              </Formik>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign in here
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

export default Register;
