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
  Chip,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { Business, LocationOn, Description, ContactPhone, VerifiedUser } from '@mui/icons-material';

const BusinessRegistrationForm = ({ onSubmit, loading = false, error = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Info
    companyName: '',
    description: '',
    businessType: '',
    categories: [],
    subcategories: [],
    
    // Business Details
    yearEstablished: '',
    employeeCount: '',
    annualTurnover: '',
    gstNumber: '',
    
    // Address
    businessAddress: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    
    // Contact Info
    contactInfo: {
      phone: '',
      alternatePhone: '',
      email: '',
      website: ''
    }
  });

  const steps = [
    'Basic Information',
    'Business Details', 
    'Address & Contact',
    'Review & Submit'
  ];

  const businessTypes = [
    'manufacturer',
    'wholesaler', 
    'distributor',
    'retailer',
    'service_provider'
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

  const employeeOptions = [
    '1-10',
    '11-50', 
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
  ];

  const turnoverOptions = [
    'Under 25 Lakh',
    '25 Lakh - 1 Crore',
    '1-5 Crore',
    '5-25 Crore', 
    '25-100 Crore',
    '100+ Crore'
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

  const handleCategoryChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      categories: newValue
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.companyName && formData.businessType && formData.categories.length > 0;
      case 1:
        return true; // Optional fields
      case 2:
        return formData.businessAddress.address && 
               formData.businessAddress.city && 
               formData.businessAddress.state && 
               formData.businessAddress.pincode &&
               formData.contactInfo.phone;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business color="primary" />
              Company Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name *"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Business Type *</InputLabel>
                  <Select
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    label="Business Type *"
                  >
                    {businessTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={electronicsCategories}
                  value={formData.categories}
                  onChange={handleCategoryChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Categories *"
                      placeholder="Select categories"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Company Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your company and what you do..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description color="primary" />
              Business Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Year Established"
                  value={formData.yearEstablished}
                  onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                  placeholder="e.g., 2010"
                  inputProps={{ min: 1900, max: new Date().getFullYear() }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Employee Count</InputLabel>
                  <Select
                    value={formData.employeeCount}
                    onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                    label="Employee Count"
                  >
                    {employeeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Annual Turnover</InputLabel>
                  <Select
                    value={formData.annualTurnover}
                    onChange={(e) => handleInputChange('annualTurnover', e.target.value)}
                    label="Annual Turnover"
                  >
                    {turnoverOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="GST Number"
                  value={formData.gstNumber}
                  onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  inputProps={{ maxLength: 15 }}
                  helperText="15-digit GST number (optional but recommended)"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="primary" />
              Address & Contact Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Address *"
                  value={formData.businessAddress.address}
                  onChange={(e) => handleInputChange('address', e.target.value, 'businessAddress')}
                  placeholder="Enter complete business address"
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City *"
                  value={formData.businessAddress.city}
                  onChange={(e) => handleInputChange('city', e.target.value, 'businessAddress')}
                  placeholder="City"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>State *</InputLabel>
                  <Select
                    value={formData.businessAddress.state}
                    onChange={(e) => handleInputChange('state', e.target.value, 'businessAddress')}
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
                  value={formData.businessAddress.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value, 'businessAddress')}
                  placeholder="110001"
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number *"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value, 'contactInfo')}
                  placeholder="+91 9876543210"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Alternate Phone"
                  value={formData.contactInfo.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value, 'contactInfo')}
                  placeholder="+91 9876543210"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business Email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value, 'contactInfo')}
                  placeholder="business@company.com"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.contactInfo.website}
                  onChange={(e) => handleInputChange('website', e.target.value, 'contactInfo')}
                  placeholder="https://www.company.com"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUser color="primary" />
              Review Your Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Company Information
                  </Typography>
                  <Typography variant="body2"><strong>Name:</strong> {formData.companyName}</Typography>
                  <Typography variant="body2"><strong>Type:</strong> {formData.businessType}</Typography>
                  <Typography variant="body2">
                    <strong>Categories:</strong> {formData.categories.join(', ')}
                  </Typography>
                  {formData.gstNumber && (
                    <Typography variant="body2"><strong>GST:</strong> {formData.gstNumber}</Typography>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {formData.businessAddress.address}, {formData.businessAddress.city}, {formData.businessAddress.state} - {formData.businessAddress.pincode}
                  </Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {formData.contactInfo.phone}</Typography>
                  {formData.contactInfo.email && (
                    <Typography variant="body2"><strong>Email:</strong> {formData.contactInfo.email}</Typography>
                  )}
                </Paper>
              </Grid>
              
              {formData.description && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2">{formData.description}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
            
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
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" textAlign="center" gutterBottom>
        Register Your Business
      </Typography>
      <Typography variant="body1" textAlign="center" color="text.secondary" gutterBottom>
        Join India's leading Electronics & Electrical B2B marketplace
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {renderStepContent(activeStep)}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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
              onClick={handleSubmit}
              disabled={loading || !isStepValid(activeStep)}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creating...' : 'Create Business Profile'}
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

export default BusinessRegistrationForm;
