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

const validationSchema = Yup.object({
  brand: Yup.string().required('Brand is required'),
  model: Yup.string().required('Model is required'),
  side: Yup.string().required('Side is required'),
  condition: Yup.string().required('Condition is required'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive'),
  location: Yup.string().required('Location is required'),
  description: Yup.string(),
});

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: listingLoading, error } = useSelector((state) => state.listings);
  const { user } = useSelector((state) => state.auth);
  
  const [initialValues, setInitialValues] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        dispatch(fetchListingStart());
        const data = await getListingById(id);
        dispatch(fetchListingSuccess(data.listing));
        
        // Check if user is the owner of the listing
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
        
        // Set uploaded images
        if (data.listing.images && data.listing.images.length > 0) {
          const formattedImages = data.listing.images.map(imageUrl => ({
            url: imageUrl,
            publicId: imageUrl.split('/').pop().split('.')[0] // Extract public ID from URL
          }));
          setUploadedImages(formattedImages);
        } else {
          setUploadedImages([]);
        }
      } catch (err) {
        dispatch(fetchListingFailure(err.message || 'Failed to fetch listing'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id, dispatch, user?._id, user?.location]);
  
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
  
  const handleRemoveImage = (index) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Include user's location from profile if not specified
      if (!values.location && user?.location) {
        values.location = user.location;
      }
      
      // Add the uploaded images to the form values
      values.images = uploadedImages.map(img => img.url);
      
      dispatch(updateListingStart());
      const response = await updateListing(id, values);
      dispatch(updateListingSuccess(response.listing));
      
      navigate(`/listings/${id}`);
    } catch (err) {
      dispatch(updateListingFailure(err.message || 'Failed to update listing'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (unauthorized) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">
          You are not authorized to edit this listing.
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
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
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

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" className="form-title">
          Edit Listing
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
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
                    disabled={listingLoading}
                  />
                </Grid>
                
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
                    disabled={listingLoading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={touched.side && Boolean(errors.side)}
                    disabled={listingLoading}
                  >
                    <InputLabel id="side-label">Side</InputLabel>
                    <Field
                      as={Select}
                      labelId="side-label"
                      id="side"
                      name="side"
                      label="Side"
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
                
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={touched.condition && Boolean(errors.condition)}
                    disabled={listingLoading}
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
                    label="Price ($)"
                    type="number"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0 } }}
                    error={touched.price && Boolean(errors.price)}
                    helperText={touched.price && errors.price}
                    disabled={listingLoading}
                  />
                </Grid>
                
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
                    disabled={listingLoading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    multiline
                    rows={4}
                    variant="outlined"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    disabled={listingLoading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Images
                    </Typography>
                    <input
                      accept="image/*"
                      type="file"
                      id="upload-button"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={listingLoading || uploadingImage}
                    />
                    <label htmlFor="upload-button">
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={listingLoading || uploadingImage}
                      >
                        {uploadingImage ? <CircularProgress size={24} /> : 'Upload More Images'}
                      </Button>
                    </label>
                  </Box>
                  
                  {uploadError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {uploadError}
                    </Alert>
                  )}
                  
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
                              minWidth: '30px',
                              width: '30px',
                              height: '30px',
                              p: 0,
                            }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {touched.images && errors.images && (
                    <Typography color="error" variant="body2">
                      {errors.images}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(-1)}
                      disabled={listingLoading || isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={listingLoading || isSubmitting || uploadingImage}
                    >
                      {listingLoading || isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
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