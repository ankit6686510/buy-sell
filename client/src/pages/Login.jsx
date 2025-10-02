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
  Chip
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
  Speed
} from '@mui/icons-material';
import { IconButton } from '@mui/material';

import { loginStart, login, loginFailure } from '../store/slices/authSlice';
import { login as loginService } from '../services/authService';
import GlassCard from '../components/modern/GlassCard';
import GradientButton from '../components/modern/GradientButton';
import { gradients, animations } from '../theme';

const validationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { loading, error } = useSelector((state) => state.auth);
  const [loginError, setLoginError] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoginError(null);
    
    try {
      dispatch(loginStart());
      const data = await loginService(values);
      dispatch(login(data));
      setSnackbarMessage('Login successful!');
      setShowSnackbar(true);
      
      // Short delay before navigation for better UX
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      setLoginError(err.message || 'Login failed');
      dispatch(loginFailure(err.message || 'Login failed'));
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

  const socialProviders = [
    { name: 'Google', icon: Google, color: '#4285f4' },
    { name: 'GitHub', icon: GitHub, color: '#333' },
    { name: 'Apple', icon: Apple, color: '#000' },
  ];

  const benefits = [
    { icon: CheckCircle, text: "94% Success Rate", color: "success.main" },
    { icon: Security, text: "Verified & Secure", color: "primary.main" },
    { icon: Speed, text: "Quick Matching", color: "secondary.main" },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
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
            radial-gradient(circle at 20% 80%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(theme.palette.primary.light, 0.15)} 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Container component="main" maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
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
                  background: gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                }}
              >
                Welcome Back!
              </Typography>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                Sign in to your account and continue your earbud matching journey with thousands of verified users.
              </Typography>
              
              <Stack spacing={3}>
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
              
              <Box sx={{ mt: 4, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  "BudMatching helped me find my missing AirPod Pro in just 2 days! The process was smooth and secure."
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: 'primary.main' }}>
                  - Sarah Chen, Verified User
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <GlassCard
              sx={{
                p: { xs: 3, sm: 4 },
                maxWidth: 480,
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
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Sign In
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Access your account to continue matching
                </Typography>
              </Box>

              {/* Social Login Buttons */}
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
                    Continue with {provider.name}
                  </Button>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <Divider sx={{ flex: 1 }} />
                <Chip label="Or continue with email" size="small" sx={{ mx: 2 }} />
                <Divider sx={{ flex: 1 }} />
              </Box>

              {loginError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    mb: 3,
                    borderRadius: 2,
                    animation: animations.slideInUp
                  }}
                >
                  {loginError}
                </Alert>
              )}

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
                        variant="outlined"
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
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
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        InputProps={{
                          startAdornment: (
                            <Lock sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />
                          ),
                          endAdornment: (
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                              sx={{ mr: 1 }}
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
                    </Stack>
                    
                    <Box sx={{ textAlign: 'right', mt: 2 }}>
                      <Link 
                        component={RouterLink} 
                        to="/forgot-password" 
                        variant="body2"
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          fontWeight: 500,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Forgot password?
                      </Link>
                    </Box>

                    <GradientButton
                      type="submit"
                      fullWidth
                      size="large"
                      disabled={loading || isSubmitting}
                      startIcon={loading ? undefined : <LoginRounded />}
                      sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </GradientButton>
                  </Form>
                )}
              </Formik>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
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
