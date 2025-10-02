import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  Paper,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

import { updateProfile as updateProfileAction } from '../store/slices/authSlice';
import { getProfile, updateProfile } from '../services/authService';
import { getUserListings } from '../services/listingService';
import { fetchUserListingsSuccess } from '../store/slices/listingSlice';
import { uploadProfilePicture } from '../services/uploadService';

import ListingCard from '../components/listings/ListingCard';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  location: Yup.string().required('Location is required'),
  phoneNumber: Yup.string(),
});

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userListings = [] } = useSelector((state) => state.listings);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user listings
        const listings = await getUserListings(user?._id);
        dispatch(fetchUserListingsSuccess(listings));
      } catch (err) {
        setError('Failed to load your listings');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchUserData();
    }
  }, [dispatch, user?._id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      setSuccess(null);
      const response = await updateProfile(values);
      dispatch(updateProfileAction(response.user));
      setSuccess('Profile updated successfully');
      setIsEditMode(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setLoading(true);
      setError(null);
      const response = await uploadProfilePicture(formData);
      dispatch(updateProfileAction({ profilePicture: response.profilePicture }));
      setSuccess('Profile picture updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <div className="profile-container">
        <Box className="profile-sidebar">
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Avatar
              src={user?.profilePicture || ''}
              alt={user?.name}
              className="profile-picture"
              sx={{ width: 150, height: 150 }}
            />
            <label htmlFor="upload-photo">
              <input
                style={{ display: 'none' }}
                id="upload-photo"
                name="upload-photo"
                type="file"
                accept="image/*"
                onChange={handlePictureUpload}
              />
              <Button
                component="span"
                variant="contained"
                color="primary"
                size="small"
                startIcon={<PhotoCameraIcon />}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  transform: 'translate(30%, 30%)',
                }}
              >
                Change
              </Button>
            </label>
          </Box>

          <Typography variant="h5" gutterBottom align="center">
            {user?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
            {user?.email}
          </Typography>
          <Typography variant="body2" align="center" paragraph>
            Member since {new Date(user?.createdAt).toLocaleDateString()}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant={isEditMode ? "outlined" : "contained"}
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setIsEditMode(!isEditMode)}
              sx={{ mb: 1 }}
            >
              {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </Box>
        </Box>

        <Box className="profile-content">
          <Paper elevation={0} sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Profile Information" />
              <Tab label="My Listings" />
            </Tabs>

            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}

                <Formik
                  initialValues={{
                    name: user?.name || '',
                    location: user?.location || '',
                    phoneNumber: user?.phoneNumber || '',
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            fullWidth
                            id="name"
                            name="name"
                            label="Full Name"
                            variant="outlined"
                            disabled={!isEditMode || loading}
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            variant="outlined"
                            disabled={true}
                            value={user?.email || ''}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            id="phoneNumber"
                            name="phoneNumber"
                            label="Phone Number"
                            variant="outlined"
                            disabled={!isEditMode || loading}
                            error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                            helperText={touched.phoneNumber && errors.phoneNumber}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            fullWidth
                            id="location"
                            name="location"
                            label="Location"
                            variant="outlined"
                            disabled={!isEditMode || loading}
                            error={touched.location && Boolean(errors.location)}
                            helperText={touched.location && errors.location}
                          />
                        </Grid>
                        {isEditMode && (
                          <Grid item xs={12}>
                            <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                              disabled={loading || isSubmitting}
                              sx={{ mt: 2 }}
                            >
                              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Listings
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : userListings.length === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    You don't have any listings yet. Create one to start finding matches!
                  </Typography>
                ) : (
                  <div className="listings-container">
                    {userListings.map((listing) => (
                      <ListingCard key={listing._id} listing={listing} />
                    ))}
                  </div>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      </div>
    </Container>
  );
};

export default Profile; 