import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  getListingById,
  updateListing
} from '../services/listingService';
import {
  fetchListingStart,
  fetchListingSuccess,
  fetchListingFailure,
  updateListingStart,
  updateListingSuccess,
  updateListingFailure,
} from '../store/slices/listingSlice';
import { uploadMultipleImages } from '../services/uploadService';

// --- CONFIGURATION & VALIDATION ---
const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 5; // 5MB per file

const validationSchema = Yup.object({
  brand: Yup.string().required('Brand is required'),
  model: Yup.string().required('Model is required'),
  side: Yup.string().required('Side is required'),
  condition: Yup.string().required('Condition is required'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive'),
  location: Yup.string().required('Location is required'),
  description: Yup.string().min(10, 'Description should be at least 10 characters'),
});

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Using a single variable for overall form submission/data fetching loading state
  const { loading: isSubmitting, error } = useSelector((state) => state.listings);
  const { user } = useSelector((state) => state.auth);

  const [initialValues, setInitialValues] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [listingLoading, setListingLoading] = useState(true); // Specific loading for initial data fetch
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- EFFECT: FETCH LISTING DATA ---
  useEffect(() => {
    const fetchListing = async () => {
      setListingLoading(true);
      try {
        dispatch(fetchListingStart());
        const data = await getListingById(id);
        dispatch(fetchListingSuccess(data.listing));

        // Authorization Check
        if (user && data.listing.seller && user._id !== data.listing.seller._id) {
          setUnauthorized(true);
          return;
        }

        // Set initial values from listing data
        const initialData = {
          brand: data.listing.brand,
          model: data.listing.model,
          side: data.listing.side,
          condition: data.listing.condition,
          price: data.listing.price,
          location: data.listing.location || user?.location || '',
          description: data.listing.description || '',
        };
        setInitialValues(initialData);

        // Set uploaded images (assuming server returns full URLs)
        if (data.listing.images && data.listing.images.length > 0) {
          const formattedImages = data.listing.images.map(imageUrl => ({
            url: imageUrl,
            // Simple placeholder for public ID extraction (needs robust server logic)
            publicId: imageUrl.split('/').pop().split('.')[0]
          }));
          setUploadedImages(formattedImages);
        } else {
          setUploadedImages([]);
        }
      } catch (err) {
        dispatch(fetchListingFailure(err.message || 'Failed to fetch listing'));
      } finally {
        setListingLoading(false);
      }
    };

    fetchListing();
  }, [id, dispatch, user?._id, user?.location]);

  // --- HANDLER: IMAGE UPLOAD ---
  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentTotal = uploadedImages.length;
    const filesToUpload = Array.from(files).slice(0, MAX_IMAGES - currentTotal);
    const totalNewImages = filesToUpload.length;

    // Client-Side Validation
    if (currentTotal >= MAX_IMAGES) {
      setUploadError(`You have reached the maximum limit of ${MAX_IMAGES} images.`);
      event.target.value = null;
      return;
    }
    const oversizedFiles = filesToUpload.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setUploadError(`One or more files exceed the ${MAX_FILE_SIZE_MB}MB size limit.`);
      event.target.value = null;
      return;
    }

    setUploadingImage(true);
    setUploadError(null);
    try {
      const result = await uploadMultipleImages(filesToUpload);

      const newImages = result.images.map(image => ({
        url: image.url,
        publicId: image.publicId
      }));

      setUploadedImages(prevImages => [...prevImages, ...newImages]);

      if (files.length > totalNewImages) {
          setUploadError(`Only ${totalNewImages} of ${files.length} images were uploaded due to the ${MAX_IMAGES} limit.`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError(error.message || 'Failed to upload images. Check file format and size.');
    } finally {
      setUploadingImage(false);
      event.target.value = null; // Clear input for re-uploading same file
    }
  };

  // --- HANDLER: REMOVE IMAGE ---
  const handleRemoveImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
  };

  // --- HANDLER: FORM SUBMISSION ---
  const handleSubmit = async (values, { setSubmitting }) => {
    if (uploadedImages.length === 0) {
        setUploadError('Please include at least one image for your listing.');
        setSubmitting(false);
        return;
    }

    try {
      // Add the uploaded images to the form values
      values.images = uploadedImages.map(img => img.url);

      dispatch(updateListingStart());
      const response = await updateListing(id, values);
      dispatch(updateListingSuccess(response.listing));

      navigate(`/listings/${id}`);
    } catch (err) {
      dispatch(updateListingFailure(err.response?.data?.message || err.message || 'Failed to update listing'));
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER: LOADING STATE ---
  if (listingLoading || !initialValues) {
    return (
      <Container sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // --- RENDER: UNAUTHORIZED STATE ---
  if (unauthorized) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">
          You are **not authorized** to edit this listing. Only the original seller can make changes.
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  // --- RENDER: FETCH ERROR STATE ---
  if (error && !isSubmitting) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          **Error loading listing:** {error}
        </Alert>
        <Button
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  // --- RENDER: MAIN FORM ---
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          **Edit Listing** 🛠️
        </Typography>

        {/* Form Submission Error */}
        {error && isSubmitting && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize // Important for updating when initialValues change
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
                {/* Brand */}
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="brand"
                    name="brand"
                    label="Brand"
                    variant="outlined"
                    error={touched.brand && Boolean(errors.brand)}
                    helperText={touched.brand && errors.brand}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* Model */}
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="model"
                    name="model"
                    label="Model"
                    variant="outlined"
                    error={touched.model && Boolean(errors.model)}
                    helperText={touched.model && errors.model}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* Side Select */}
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={touched.side && Boolean(errors.side)}
                    disabled={isSubmitting}
                  >
                    <InputLabel id="side-label">Side</InputLabel>
                    <Field
                      as={Select}
                      labelId="side-label"
                      id="side"
                      name="side"
                      label="Side"
                      value={values.side || ''} // CRITICAL: Ensure value is set from Formik state
                      onChange={(event) => setFieldValue('side', event.target.value)}
                    >
                      <MenuItem value="">Select a side</MenuItem>
                      <MenuItem value="left">Left</MenuItem>
                      <MenuItem value="right">Right</MenuItem>
                    </Field>
                    {touched.side && errors.side && (
                      <FormHelperText>{errors.side}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Condition Select */}
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={touched.condition && Boolean(errors.condition)}
                    disabled={isSubmitting}
                  >
                    <InputLabel id="condition-label">Condition</InputLabel>
                    <Field
                      as={Select}
                      labelId="condition-label"
                      id="condition"
                      name="condition"
                      label="Condition"
                      value={values.condition || ''} // CRITICAL: Ensure value is set from Formik state
                      onChange={(event) => setFieldValue('condition', event.target.value)}
                    >
                      <MenuItem value="">Select condition</MenuItem>
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="like_new">Like New</MenuItem>
                      <MenuItem value="good">Good</MenuItem>
                      <MenuItem value="fair">Fair</MenuItem>
                      <MenuItem value="poor">Poor</MenuItem>
                    </Field>
                    {touched.condition && errors.condition && (
                      <FormHelperText>{errors.condition}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Price */}
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="price"
                    name="price"
                    label="Price ($)"
                    type="number"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0 } }}
                    error={touched.price && Boolean(errors.price)}
                    helperText={touched.price && errors.price}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="location"
                    name="location"
                    label="Location"
                    variant="outlined"
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="description"
                    name="description"
                    label="Description (Optional)"
                    multiline
                    rows={4}
                    variant="outlined"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* Image Upload Section */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Product Photos ({uploadedImages.length}/{MAX_IMAGES})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      You can remove existing photos or upload new ones (Max {MAX_IMAGES} images).
                    </Typography>
                    <input
                      accept="image/*"
                      type="file"
                      id="upload-button"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={isSubmitting || uploadingImage || uploadedImages.length >= MAX_IMAGES}
                    />
                    <label htmlFor="upload-button">
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={isSubmitting || uploadingImage || uploadedImages.length >= MAX_IMAGES}
                      >
                        {uploadingImage ? <CircularProgress size={24} /> : 'Upload More Images'}
                      </Button>
                    </label>
                  </Box>

                  {/* Image Previews */}
                  {uploadedImages.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      {uploadedImages.map((img, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            height: 100,
                            width: 100,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid #ccc',
                          }}
                        >
                          <Box
                            component="img"
                            src={img.url}
                            alt={`Preview ${index}`}
                            sx={{ height: 100, width: 100, objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                              },
                            }}
                            onClick={() => handleRemoveImage(index)}
                            disabled={isSubmitting}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Image Upload Error/Warning */}
                  {uploadError && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      {uploadError}
                    </Alert>
                  )}
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || uploadingImage || uploadedImages.length === 0}
                    >
                      {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default EditListing;