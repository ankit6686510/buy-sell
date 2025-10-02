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
  title: Yup.string().required('Product title is required'),
  category: Yup.string().required('Category is required'),
  brand: Yup.string(),
  condition: Yup.string().required('Condition is required'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive'),
  location: Yup.string().required('Location is required'),
  description: Yup.string().required('Description is required'),
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

    setUploadingImage(true);
    setUploadError(null);
    try {
      const result = await uploadMultipleImages(Array.from(files));
      
      const newImages = result.images.map(image => ({
        url: image.url,
        publicId: image.publicId
      }));
      
      setUploadedImages([...uploadedImages, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError(error.message || 'Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const removeImage = (indexToRemove) => {
    setUploadedImages(uploadedImages.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
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
      navigate(`/listings/${response.listing._id}`);
    } catch (err) {
      dispatch(createListingFailure(err.message || 'Failed to create listing'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 800,
            background: gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 2
          }}
        >
          Sell Your Product
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          List your item for sale and connect with buyers in your area
        </Typography>
        
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
          {({ errors, touched, isSubmitting, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="title"
                    name="title"
                    label="Product Title"
                    placeholder="e.g., iPhone 14 Pro Max, Nike Air Jordan, Samsung TV..."
                    variant="outlined"
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={touched.category && Boolean(errors.category)}
                    disabled={loading}
                  >
                    <InputLabel id="category-label">Category</InputLabel>
                    <Field
                      as={Select}
                      labelId="category-label"
                      id="category"
                      name="category"
                      label="Category"
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
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={touched.condition && Boolean(errors.condition)}
                    disabled={loading}
                  >
                    <InputLabel id="condition-label">Condition</InputLabel>
                    <Field
                      as={Select}
                      labelId="condition-label"
                      id="condition"
                      name="condition"
                      label="Condition"
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
                    disabled={loading}
                  />
                </Grid>
                
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
                    disabled={loading}
                  />
                </Grid>
                
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
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Upload Images (Up to 10 photos)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add clear photos to help buyers see your product better
                    </Typography>
                    <input
                      accept="image/*"
                      type="file"
                      id="upload-button"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={loading || uploadingImage}
                    />
                    <label htmlFor="upload-button">
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={loading || uploadingImage}
                      >
                        {uploadingImage ? <CircularProgress size={24} /> : 'Upload Images'}
                      </Button>
                    </label>
                  </Box>
                  
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
                            overflow: 'hidden'
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
                              bgcolor: 'rgba(0,0,0,0.3)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.5)',
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
                  
                  {uploadError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {uploadError}
                    </Alert>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(-1)}
                      disabled={loading || isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading || isSubmitting || uploadingImage}
                    >
                      {loading || isSubmitting ? <CircularProgress size={24} /> : 'List Product'}
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
