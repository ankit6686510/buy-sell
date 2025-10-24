import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

import { createListingStart, createListingSuccess, createListingFailure } from '../store/slices/listingSlice';
import { createListing } from '../services/listingService';
import { uploadMultipleImages } from '../services/uploadService';
import { gradients } from '../theme';

// --- CONFIGURATION ---
const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 5; // 5MB per file

// Product categories
const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion & Clothing' },
  { value: 'home_garden', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'books_media', label: 'Books & Media' },
  { value: 'toys_games', label: 'Toys & Games' },
  { value: 'health_beauty', label: 'Health & Beauty' },
  { value: 'others', label: 'Others' }
];

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Product title is required')
    .min(5, 'Title must be at least 5 characters'),
  category: Yup.string().required('Category is required'),
  brand: Yup.string(),
  condition: Yup.string().required('Condition is required'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive')
    .max(9999999, 'Price too high'),
  location: Yup.string().required('Location is required'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters'),
});

const CreateListing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.listings);
  const { user } = useSelector((state) => state.auth);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentTotal = uploadedImages.length;
    const filesToUpload = Array.from(files).slice(0, MAX_IMAGES - currentTotal);
    const totalNewImages = filesToUpload.length;

    // --- Basic Client-Side Validation ---
    if (currentTotal >= MAX_IMAGES) {
      setUploadError(`You can only upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }
    const oversizedFiles = filesToUpload.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setUploadError(`One or more files exceed the ${MAX_FILE_SIZE_MB}MB size limit.`);
      return;
    }
    // ------------------------------------

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
      setUploadError(error.message || 'Failed to upload images. Check file type and size.');
    } finally {
      setUploadingImage(false);
      // Clear the file input value to allow the user to select the same file(s) again
      event.target.value = null;
    }
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages(uploadedImages.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (uploadedImages.length === 0) {
      setUploadError('Please upload at least one image for your listing.');
      setSubmitting(false);
      return;
    }

    try {
      // Include user's location from profile if not specified
      if (!values.location && user?.location) {
        values.location = user.location;
      }

      // Add the uploaded images to the form values
      values.images = uploadedImages.map(img => img.url);

      dispatch(createListingStart());
      const response = await createListing(values);
      dispatch(createListingSuccess(response.listing));

      resetForm();
      setUploadedImages([]);
      // Use the newly created listing ID for navigation
      navigate(`/listings/${response.listing._id}`);
    } catch (err) {
      dispatch(createListingFailure(err.response?.data?.message || err.message || 'Failed to create listing'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: gradients.primary, // Assuming gradients is defined in your theme
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 2
          }}
        >
          Sell Your Product 🚀
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          List your item for sale and connect with buyers in your area.
        </Typography>

        {/* Global Listing Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{
            title: '',
            category: '',
            brand: '',
            condition: '',
            price: '',
            description: '',
            location: user?.location || '',
            images: [],
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
                {/* Product Title */}
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="title"
                    name="title"
                    label="Product Title"
                    placeholder="e.g., iPhone 14 Pro Max, Nike Air Jordan..."
                    variant="outlined"
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                    disabled={loading || isSubmitting}
                  />
                </Grid>

                {/* Category Select */}
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={touched.category && Boolean(errors.category)}
                    disabled={loading || isSubmitting}
                  >
                    <InputLabel id="category-label">Category</InputLabel>
                    <Field
                      as={Select}
                      labelId="category-label"
                      id="category"
                      name="category"
                      label="Category"
                      // CRITICAL FIX: Manually setting value/onChange for MUI Select in Formik
                      value={values.category}
                      onChange={(event) => setFieldValue('category', event.target.value)}
                    >
                      <MenuItem value="">Select a category</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          {category.label}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.category && errors.category && (
                      <FormHelperText>{errors.category}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Brand */}
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="brand"
                    name="brand"
                    label="Brand (Optional)"
                    placeholder="e.g., Apple, Samsung, Nike..."
                    variant="outlined"
                    error={touched.brand && Boolean(errors.brand)}
                    helperText={touched.brand && errors.brand}
                    disabled={loading || isSubmitting}
                  />
                </Grid>

                {/* Condition Select */}
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={touched.condition && Boolean(errors.condition)}
                    disabled={loading || isSubmitting}
                  >
                    <InputLabel id="condition-label">Condition</InputLabel>
                    <Field
                      as={Select}
                      labelId="condition-label"
                      id="condition"
                      name="condition"
                      label="Condition"
                      // CRITICAL FIX: Manually setting value/onChange for MUI Select in Formik
                      value={values.condition}
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
                    label="Price"
                    type="number"
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Enter price in rupees"
                    error={touched.price && Boolean(errors.price)}
                    helperText={touched.price && errors.price}
                    disabled={loading || isSubmitting}
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="location"
                    name="location"
                    label="Location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    variant="outlined"
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                    disabled={loading || isSubmitting}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    placeholder="Describe your product in detail - condition, features, reason for selling..."
                    multiline
                    rows={4}
                    variant="outlined"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    disabled={loading || isSubmitting}
                  />
                </Grid>

                {/* Image Upload Section */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Product Photos ({uploadedImages.length}/{MAX_IMAGES})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add clear photos to help buyers see your product better (Max {MAX_IMAGES} images, {MAX_FILE_SIZE_MB}MB each).
                    </Typography>
                    <input
                      accept="image/*"
                      type="file"
                      id="upload-button"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={loading || isSubmitting || uploadingImage || uploadedImages.length >= MAX_IMAGES}
                    />
                    <label htmlFor="upload-button">
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={loading || isSubmitting || uploadingImage || uploadedImages.length >= MAX_IMAGES}
                      >
                        {uploadingImage ? <CircularProgress size={24} /> : 'Upload Images'}
                      </Button>
                    </label>
                  </Box>

                  {/* Image Previews */}
                  {uploadedImages.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
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
                            onClick={() => removeImage(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Image Upload Error */}
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
                      color="secondary" // Changed to secondary for differentiation
                      onClick={() => navigate(-1)}
                      disabled={loading || isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading || isSubmitting || uploadingImage || uploadedImages.length === 0}
                    >
                      {loading || isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'List Product'}
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

export default CreateListing;