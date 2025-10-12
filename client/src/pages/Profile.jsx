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
    useTheme, // 👈 IMPORTED: For accessing the theme
    alpha, // 👈 IMPORTED: For creating mode-aware translucent effects
    Stack,
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
    const theme = useTheme(); // 👈 Initialized theme
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
                // Note: It's cleaner to handle listing loading state in listingSlice if possible, 
                // but we use local `loading` for now.
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
            // Assuming the backend returns the updated user object or at least the new profilePicture URL
            dispatch(updateProfileAction({ profilePicture: response.profilePicture })); 
            setSuccess('Profile picture updated successfully');
        } catch (err) {
            setError(err.message || 'Failed to update profile picture');
        } finally {
            setLoading(false);
        }
    };

    // Dark Mode aware color definitions
    const sidebarBgColor = alpha(theme.palette.background.paper, 0.7);
    const contentBgColor = theme.palette.background.paper;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                }}
            >
                {/* Profile Sidebar */}
                <Box
                    sx={{
                        width: { xs: '100%', md: 300 },
                        p: 3,
                        borderRadius: 3,
                        // 👈 DARK MODE FIX: Using theme colors for background, border, and blur effect
                        bgcolor: sidebarBgColor, 
                        backdropFilter: 'blur(8px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.05)}`,
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Box sx={{ position: 'relative', mb: 4, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                            src={user?.profilePicture || ''}
                            alt={user?.name}
                            sx={{ width: 150, height: 150, border: `3px solid ${theme.palette.primary.main}` }}
                        />
                        <label htmlFor="upload-photo">
                            <input
                                style={{ display: 'none' }}
                                id="upload-photo"
                                name="upload-photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePictureUpload}
                                disabled={loading}
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
                                    transform: 'translate(-5px, -5px)', // Adjusted position
                                    borderRadius: '50px',
                                    minWidth: 0,
                                    p: 1.5,
                                    boxShadow: theme.shadows[4]
                                }}
                                disabled={loading}
                            >
                                {/* Removed 'Change' text to make button circular and cleaner */}
                            </Button>
                        </label>
                    </Box>

                    <Typography variant="h5" fontWeight={600} gutterBottom align="center">
                        {user?.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
                        {user?.email}
                    </Typography>
                    <Typography variant="body2" color="text.disabled" align="center" paragraph>
                        Member since {new Date(user?.createdAt).toLocaleDateString()}
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            variant={isEditMode ? "outlined" : "contained"}
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditMode(!isEditMode)}
                            sx={{ mb: 1, py: 1, px: 3, borderRadius: 2 }}
                        >
                            {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
                        </Button>
                    </Box>
                </Box>

                {/* Profile Content (Tabs) */}
                <Box sx={{ flexGrow: 1, width: { xs: '100%', md: 'auto' } }}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 0, 
                            borderRadius: 3, 
                            bgcolor: contentBgColor // 👈 DARK MODE FIX
                        }}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            sx={{ 
                                mb: 0, 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                px: 3 // Added padding to tabs
                            }}
                        >
                            <Tab label="Profile Information" sx={{ textTransform: 'none', fontWeight: 600 }} />
                            <Tab label="My Listings" sx={{ textTransform: 'none', fontWeight: 600 }} />
                        </Tabs>

                        {activeTab === 0 && (
                            <Box sx={{ p: 4 }}>
                                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                                    Account Details
                                </Typography>
                                {(error || success) && (
                                    <Alert severity={error ? "error" : "success"} sx={{ mb: 3 }}>
                                        {error || success}
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
                                            <Stack spacing={3}>
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
                                                <Field
                                                    as={TextField}
                                                    fullWidth
                                                    id="email"
                                                    name="email"
                                                    label="Email (Read Only)"
                                                    variant="outlined"
                                                    disabled={true} // Email should generally be read-only here
                                                    value={user?.email || ''}
                                                />
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
                                                {isEditMode && (
                                                    <Box sx={{ pt: 2 }}>
                                                        <Button
                                                            type="submit"
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={loading || isSubmitting ? undefined : <EditIcon />}
                                                            disabled={loading || isSubmitting}
                                                            sx={{ py: 1.5, px: 4, borderRadius: 2 }}
                                                        >
                                                            {(loading || isSubmitting) ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                                                        </Button>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Form>
                                    )}
                                </Formik>
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <Box sx={{ p: 4 }}>
                                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                                    Your Active Listings ({userListings.length})
                                </Typography>
                                
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : userListings.length === 0 ? (
                                    <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
                                        <Typography variant="body1">
                                            You don't have any listings yet. Create one to start finding matches!
                                        </Typography>
                                    </Alert>
                                ) : (
                                    <Grid container spacing={3}>
                                        {userListings.map((listing) => (
                                            <Grid item xs={12} sm={6} key={listing._id}>
                                                <ListingCard listing={listing} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
};

export default Profile;