import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';

import { forgotPassword, resetPassword } from '../services/authService';

// For the forgot password form
const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
});

// For the reset password form
const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const PasswordReset = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const isResetMode = !!token;
  
  const handleForgotPassword = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      setError(null);
      
      await forgotPassword(values.email);
      
      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  
  const handleResetPassword = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError(null);
      
      await resetPassword(token, values.password);
      
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          {isResetMode ? 'Reset Password' : 'Forgot Password'}
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {isResetMode 
              ? 'Your password has been reset successfully! Redirecting to login...'
              : 'Password reset link has been sent to your email.'}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {isResetMode ? (
          // Reset Password Form
          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={resetPasswordSchema}
            onSubmit={handleResetPassword}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="password"
                      label="New Password"
                      type="password"
                      variant="outlined"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      disabled={loading || success}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      variant="outlined"
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      disabled={loading || success}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || loading || success}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        ) : (
          // Forgot Password Form
          <Formik
            initialValues={{ email: '' }}
            validationSchema={forgotPasswordSchema}
            onSubmit={handleForgotPassword}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="body1" paragraph>
                      Enter your email address and we'll send you a link to reset your password.
                    </Typography>
                    <Field
                      as={TextField}
                      fullWidth
                      name="email"
                      label="Email Address"
                      variant="outlined"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="text"
                        onClick={() => navigate('/login')}
                        disabled={loading}
                      >
                        Back to Login
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        )}
      </Paper>
    </Container>
  );
};

export default PasswordReset; 