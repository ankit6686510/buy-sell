import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider
} from '@mui/material';
import {
  RequestQuote,
  Category,
  LocationOn,
  AttachFile,
  DeleteOutline,
  CalendarToday,
  CurrencyRupee
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const RFQSubmissionForm = ({ onSubmit, loading = false, error = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    // Basic Details
    title: '',
    description: '',
    category: '',
    subcategory: '',
    
    // Quantity & Budget
    quantity: '',
    unit: 'pieces',
    budgetRange: {
      min: '',
      max: '',
      currency: 'INR'
    },
    
    // Delivery Information
    deliveryLocation: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    expectedDelivery: null,
    
    // Specifications
    specifications: {
      voltage: '',
      wattage: '',
      warranty: '',
      brand: '',
      model: '',
      color: '',
      features: [],
      customSpecs: {}
    },
    
    // Additional Requirements
    additionalRequirements: {
      packaging: '',
      testing: '',
      documentation: '',
      customization: ''
    },
    
    // Settings
    visibility: 'public',
    maxQuotes: 10
  });

  const steps = [
    'Basic Details',
    'Quantity & Budget',
    'Delivery & Timeline',
    'Specifications',
    'Review & Submit'
  ];

  const electronicsCategories = [
    'Consumer Electronics',
    'Home Appliances', 
    'Electrical Components',
    'Lighting',
    'Industrial Equipment',
    'Mobile & Accessories',
    'Computers & Laptops',
    'Audio & Video',
    'Kitchen Appliances',
    'Wires & Cables',
    'Switches & Sockets',
    'LED Lights',
    'Motors & Drives'
  ];

  const subcategoryMap = {
    'Consumer Electronics': ['Mobile Phones', 'Tablets', 'Headphones', 'Smart Watches', 'Power Banks'],
    'Home Appliances': ['Refrigerators', 'Washing Machines', 'Microwaves', 'Air Conditioners', 'Water Heaters'],
    'Electrical Components': ['Resistors', 'Capacitors', 'Transformers', 'Circuit Breakers', 'Relays'],
    'Lighting': ['LED Bulbs', 'LED Strips', 'Street Lights', 'Emergency Lights', 'Smart Lights'],
    'Industrial Equipment': ['Motors', 'Generators', 'Control Panels', 'Sensors', 'Automation Systems']
  };

  const units = [
    'pieces', 'kg', 'boxes', 'meters', 'liters', 'sets', 'cartons', 'tons', 'grams'
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Delhi'
  ];

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSpecificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  const handleFeaturesChange = (event, newValue) => {
    handleSpecificationChange('features', newValue);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type.includes('image') ? 'image' : 'document'
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      attachments: attachments.map(att => att.file)
    };
    onSubmit(submitData);
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.title && formData.description && formData.category;
      case 1:
        return formData.quantity && formData.budgetRange.min && formData.budgetRange.max;
      case 2:
        return formData.deliveryLocation.address && 
               formData.deliveryLocation.city && 
               formData.deliveryLocation.state && 
               formData.expectedDelivery;
      case 3:
        return true; // Specifications are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RequestQuote color="primary" />
              What do you need?
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="RFQ Title *"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., LED Bulbs for Office Building"
                  helperText="Clear, specific title helps suppliers understand your requirement"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => {
                      handleInputChange('category', e.target.value);
                      handleInputChange('subcategory', ''); // Reset subcategory
                    }}
                    label="Category *"
                  >
                    {electronicsCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!formData.category}>
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    label="Subcategory"
                  >
                    {(subcategoryMap[formData.category] || []).map((subcat) => (
                      <MenuItem key={subcat} value={subcat}>
                        {subcat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Detailed Description *"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your requirements in detail - specifications, quality expectations, intended use, etc."
                  helperText="Detailed description helps suppliers provide accurate quotes"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CurrencyRupee color="primary" />
              Quantity & Budget
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity Required *"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="e.g., 100"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Unit *</InputLabel>
                  <Select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    label="Unit *"
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Budget Range (Total Project Value)
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Budget (₹) *"
                  value={formData.budgetRange.min}
                  onChange={(e) => handleInputChange('min', e.target.value, 'budgetRange')}
                  placeholder="e.g., 50000"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Budget (₹) *"
                  value={formData.budgetRange.max}
                  onChange={(e) => handleInputChange('max', e.target.value, 'budgetRange')}
                  placeholder="e.g., 100000"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              
              {formData.budgetRange.min && formData.budgetRange.max && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Budget Range: ₹{parseInt(formData.budgetRange.min).toLocaleString()} - ₹{parseInt(formData.budgetRange.max).toLocaleString()}
                    {formData.quantity && (
                      <>
                        <br />
                        Price per {formData.unit}: ₹{Math.round(formData.budgetRange.min / formData.quantity).toLocaleString()} - ₹{Math.round(formData.budgetRange.max / formData.quantity).toLocaleString()}
                      </>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="primary" />
              Delivery & Timeline
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Address *"
                  value={formData.deliveryLocation.address}
                  onChange={(e) => handleInputChange('address', e.target.value, 'deliveryLocation')}
                  placeholder="Complete delivery address"
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City *"
                  value={formData.deliveryLocation.city}
                  onChange={(e) => handleInputChange('city', e.target.value, 'deliveryLocation')}
                  placeholder="City"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>State *</InputLabel>
                  <Select
                    value={formData.deliveryLocation.state}
                    onChange={(e) => handleInputChange('state', e.target.value, 'deliveryLocation')}
                    label="State *"
                  >
                    {indianStates.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pincode *"
                  value={formData.deliveryLocation.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value, 'deliveryLocation')}
                  placeholder="110001"
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Expected Delivery Date *"
                    value={formData.expectedDelivery}
                    onChange={(newValue) => handleInputChange('expectedDelivery', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Quotes to Receive"
                  value={formData.maxQuotes}
                  onChange={(e) => handleInputChange('maxQuotes', e.target.value)}
                  inputProps={{ min: 3, max: 50 }}
                  helperText="More quotes = better price comparison"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Category color="primary" />
              Technical Specifications
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preferred Brand"
                  value={formData.specifications.brand}
                  onChange={(e) => handleSpecificationChange('brand', e.target.value)}
                  placeholder="e.g., Philips, Havells"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model/Part Number"
                  value={formData.specifications.model}
                  onChange={(e) => handleSpecificationChange('model', e.target.value)}
                  placeholder="Specific model if known"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Voltage"
                  value={formData.specifications.voltage}
                  onChange={(e) => handleSpecificationChange('voltage', e.target.value)}
                  placeholder="e.g., 220V, 12V"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Wattage/Power"
                  value={formData.specifications.wattage}
                  onChange={(e) => handleSpecificationChange('wattage', e.target.value)}
                  placeholder="e.g., 10W, 100W"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Warranty Required"
                  value={formData.specifications.warranty}
                  onChange={(e) => handleSpecificationChange('warranty', e.target.value)}
                  placeholder="e.g., 2 years, 5 years"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Color/Finish"
                  value={formData.specifications.color}
                  onChange={(e) => handleSpecificationChange('color', e.target.value)}
                  placeholder="e.g., White, Black, Stainless Steel"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={formData.specifications.features}
                  onChange={handleFeaturesChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Special Features"
                      placeholder="Type and press Enter (e.g., Dimmable, Smart Control)"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Additional Requirements
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Packaging Requirements"
                  value={formData.additionalRequirements.packaging}
                  onChange={(e) => handleInputChange('packaging', e.target.value, 'additionalRequirements')}
                  placeholder="e.g., Retail packaging, Bulk packaging"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Testing/Certification"
                  value={formData.additionalRequirements.testing}
                  onChange={(e) => handleInputChange('testing', e.target.value, 'additionalRequirements')}
                  placeholder="e.g., ISI marked, CE certified"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Documentation Requirements"
                  value={formData.additionalRequirements.documentation}
                  onChange={(e) => handleInputChange('documentation', e.target.value, 'additionalRequirements')}
                  placeholder="e.g., Test certificates, Compliance documents"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ border: '1px dashed', borderColor: 'grey.300', borderRadius: 1, p: 2 }}>
                  <input
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    style={{ display: 'none' }}
                    id="file-upload"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFile />}
                      sx={{ mb: 1 }}
                    >
                      Upload Attachments
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary">
                    Upload drawings, specifications, reference images, etc.
                  </Typography>
                  
                  {attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {attachments.map((attachment, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="body2">{attachment.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatFileSize(attachment.size)}
                                </Typography>
                              </Box>
                              <IconButton size="small" onClick={() => removeAttachment(index)}>
                                <DeleteOutline />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your RFQ
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Basic Details
                    </Typography>
                    <Typography variant="body2"><strong>Title:</strong> {formData.title}</Typography>
                    <Typography variant="body2"><strong>Category:</strong> {formData.category}</Typography>
                    {formData.subcategory && (
                      <Typography variant="body2"><strong>Subcategory:</strong> {formData.subcategory}</Typography>
                    )}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Description:</strong> {formData.description.substring(0, 100)}...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Quantity & Budget
                    </Typography>
                    <Typography variant="body2">
                      <strong>Quantity:</strong> {formData.quantity} {formData.unit}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Budget:</strong> ₹{parseInt(formData.budgetRange.min || 0).toLocaleString()} - ₹{parseInt(formData.budgetRange.max || 0).toLocaleString()}
                    </Typography>
                    {formData.quantity && formData.budgetRange.min && (
                      <Typography variant="body2">
                        <strong>Per unit:</strong> ₹{Math.round((formData.budgetRange.min / formData.quantity) || 0).toLocaleString()} - ₹{Math.round((formData.budgetRange.max / formData.quantity) || 0).toLocaleString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Delivery Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {formData.deliveryLocation.city}, {formData.deliveryLocation.state}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Expected Delivery:</strong> {formData.expectedDelivery ? new Date(formData.expectedDelivery).toLocaleDateString() : 'Not set'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Max Quotes:</strong> {formData.maxQuotes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {(formData.specifications.brand || formData.specifications.voltage || formData.specifications.wattage) && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Specifications
                      </Typography>
                      {formData.specifications.brand && (
                        <Typography variant="body2"><strong>Brand:</strong> {formData.specifications.brand}</Typography>
                      )}
                      {formData.specifications.voltage && (
                        <Typography variant="body2"><strong>Voltage:</strong> {formData.specifications.voltage}</Typography>
                      )}
                      {formData.specifications.wattage && (
                        <Typography variant="body2"><strong>Wattage:</strong> {formData.specifications.wattage}</Typography>
                      )}
                      {formData.specifications.features.length > 0 && (
                        <Typography variant="body2">
                          <strong>Features:</strong> {formData.specifications.features.join(', ')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {attachments.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Attachments ({attachments.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {attachments.map((attachment, index) => (
                          <Chip
                            key={index}
                            label={attachment.name}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>What happens next?</strong>
                <br />
                1. Your RFQ will be published and visible to verified suppliers
                <br />
                2. Suppliers will submit quotes with their pricing and terms
                <br />
                3. You can compare quotes and directly contact suppliers
                <br />
                4. Choose the best supplier and finalize your order
              </Typography>
            </Alert>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" textAlign="center" gutterBottom>
        Post Your Requirement
      </Typography>
      <Typography variant="body1" textAlign="center" color="text.secondary" gutterBottom>
        Get quotes from verified Electronics & Electrical suppliers across India
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {renderStepContent(activeStep)}
      
      <Divider sx={{ mt: 4, mb: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !isStepValid(activeStep)}
              startIcon={loading ? <CircularProgress size={20} /> : <RequestQuote />}
            >
              {loading ? 'Publishing...' : 'Post RFQ'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid(activeStep)}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default RFQSubmissionForm;
