import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Business,
  Edit,
  Verified,
  Star,
  TrendingUp,
  AttachMoney,
  Upload,
  Download,
  Visibility,
  CreditCard,
  Analytics,
  PhotoCamera,
  Description,
  LocationOn,
  Phone,
  Email,
  CheckCircle,
  Schedule,
  Warning,
  Category, // <--- FIXED: CRITICAL MISSING IMPORT
  Language  // <--- FIXED: CRITICAL MISSING IMPORT
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../services/api';

// Placeholder for a chart component, assuming a simple area chart like Recharts/Nivo
const PlaceholderChart = ({ title, data, color }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="subtitle1" gutterBottom>{title}</Typography>
      <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h5" color={color}>
          [Chart Placeholder]
        </Typography>
      </Box>
      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
        Data for the last 30 days.
      </Typography>
    </CardContent>
  </Card>
);

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [companyData, setCompanyData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false); // New state for dialog actions

  // Dialog states
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [uploadDocDialog, setUploadDocDialog] = useState(false);
  const [buyCreditsDialog, setBuyCreditsDialog] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    companyName: '',
    description: '',
    industry: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    gstNumber: '',
    panNumber: '',
    yearEstablished: '',
    numberOfEmployees: '',
    annualTurnover: '',
    logo: '' // Added logo URL field
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [logoFile, setLogoFile] = useState(null); // New state for logo file upload

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { user } = useSelector(state => state.auth);

  const industries = [
    'Electronics & Electrical',
    'Manufacturing',
    'Automotive',
    'Textiles',
    'Chemicals',
    'Pharmaceuticals',
    'Food & Beverages',
    'Construction',
    'Information Technology',
    'Telecommunications',
    'Retail & Trading',
    'Import & Export',
    'Healthcare',
    'Education',
    'Real Estate',
    'Agriculture',
    'Other'
  ];

  const documentTypes = [
    'GST Certificate',
    'PAN Card',
    'Company Registration Certificate',
    'Trade License',
    'ISO Certificate',
    'Quality Certificate',
    'Import Export License',
    'Other'
  ];

  const employeeRanges = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
  ];

  const turnoverRanges = [
    'Up to ₹1 Cr',
    '₹1-5 Cr',
    '₹5-25 Cr',
    '₹25-100 Cr',
    '₹100-500 Cr',
    '₹500+ Cr'
  ];

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  // Helper function to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const loadCompanyData = useCallback(async () => {
    try {
      const response = await api.get('/api/companies/my-profile');
      const data = response.data.company;
      setCompanyData(data);
      if (data) {
        setProfileForm(prev => ({
          ...prev,
          ...data,
          // Ensure all keys are present even if null/undefined in data
          companyName: data.companyName || '',
          description: data.description || '',
          industry: data.industry || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          gstNumber: data.gstNumber || '',
          panNumber: data.panNumber || '',
          yearEstablished: data.yearEstablished || '',
          numberOfEmployees: data.numberOfEmployees || '',
          annualTurnover: data.annualTurnover || '',
          logo: data.logo || ''
        }));
      }
    } catch (err) {
      setError('Failed to load company data. Please try again.');
      console.error('Company data error:', err);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await api.get('/api/companies/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanyData();
    loadAnalytics();
  }, [loadCompanyData, loadAnalytics]);


  const handleUpdateProfile = async () => {
    setDialogLoading(true);
    try {
      // Logic for uploading logo first
      let updatedProfileForm = { ...profileForm };
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        
        // Assuming an API endpoint for logo upload that returns the new logo URL
        const logoResponse = await api.post('/api/companies/upload-logo', logoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (logoResponse.data.success) {
          updatedProfileForm.logo = logoResponse.data.logoUrl;
          setProfileForm(prev => ({ ...prev, logo: logoResponse.data.logoUrl })); // Update form state with new URL
        }
      }

      // Update remaining profile data
      const response = await api.put('/api/companies/profile', updatedProfileForm);

      if (response.data.success) {
        setCompanyData(response.data.company);
        setEditProfileDialog(false);
        setLogoFile(null); // Clear logo file state
        showSnackbar('Company profile updated successfully! 🎉', 'success');
      }
    } catch (err) {
      showSnackbar('Failed to update profile', 'error');
      console.error('Update profile error:', err);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showSnackbar('File size should be less than 5MB', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for logo
        showSnackbar('Logo size should be less than 2MB', 'error');
        return;
      }
      setLogoFile(file);
      // Optional: Set a temporary URL for preview in the dialog
      // setProfileForm(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
    }
  };

  const handleDocumentUpload = async () => {
    setDialogLoading(true);
    try {
      if (!selectedFile || !documentType) {
        showSnackbar('Please select a file and document type', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('type', documentType);

      const response = await api.post('/api/companies/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showSnackbar('Document uploaded successfully! 📄', 'success');
        setUploadDocDialog(false);
        setSelectedFile(null);
        setDocumentType('');
        loadCompanyData();
      }
    } catch (err) {
      showSnackbar('Failed to upload document', 'error');
      console.error('Document upload error:', err);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleBuyCredits = async () => {
    setDialogLoading(true);
    const amount = parseInt(creditAmount);
    if (!amount || amount < 10) {
      showSnackbar('Minimum credit purchase is 10 credits', 'error');
      setDialogLoading(false);
      return;
    }

    const isRazorpayLoaded = await loadRazorpayScript();
    if (!isRazorpayLoaded) {
      showSnackbar('Payment gateway failed to load. Please try again.', 'error');
      setDialogLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/companies/buy-credits', {
        credits: amount
      });

      if (response.data.success) {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: response.data.order.amount,
          currency: 'INR',
          name: 'BudMatching',
          description: `Purchase of ${amount} Lead Credits`,
          order_id: response.data.order.id,
          handler: async function (razorpayResponse) {
            setDialogLoading(true); // Re-enable loading for verification step
            try {
              await api.post('/api/payments/verify', {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                type: 'credits'
              });

              showSnackbar('Credits purchased successfully! 💰', 'success');
              setBuyCreditsDialog(false);
              setCreditAmount('');
              loadCompanyData();
            } catch (error) {
              showSnackbar('Payment verification failed', 'error');
              console.error('Payment verification error:', error);
            } finally {
              setDialogLoading(false);
            }
          },
          prefill: {
            name: companyData?.companyName || user?.name || '',
            email: companyData?.email || user?.email || '',
            contact: companyData?.phone || user?.phone || ''
          },
          theme: {
            color: '#1976d2'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response) {
            showSnackbar(`Payment failed: ${response.error.description}`, 'error');
            setDialogLoading(false); // Disable loading on fail
        });
        razorpay.open();
      }
    } catch (err) {
      showSnackbar('Failed to initiate payment', 'error');
      console.error('Buy credits error:', err);
      // FIXED: Ensure dialog loading is disabled on API failure before Razorpay is launched
      setDialogLoading(false); 
    }
    // Removed the complex 'finally' block as the logic is now handled in the try/catch blocks more cleanly
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getVerificationStatus = (documents) => {
    if (!documents || documents.length === 0) return { status: 'pending', label: 'Pending', color: 'warning' };

    const verified = documents.filter(doc => doc.status === 'verified').length;
    const total = documents.length;

    if (verified === total) return { status: 'verified', label: 'Fully Verified', color: 'success' };
    if (verified > 0) return { status: 'partial', label: 'Partial Verification', color: 'info' };
    return { status: 'pending', label: 'Pending Verification', color: 'warning' };
  };

  // --- Components for Tabs ---
  const CompanyOverview = () => {
    const verification = getVerificationStatus(companyData?.documents);

    // Calculate completion for display
    const profileCompletion = Math.round(((companyData?.profileCompleteness || 0) * 100));

    return (
      <Grid container spacing={3}>
        {/* Company Profile Card */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.light', border: '2px solid' }}
                    src={companyData?.logo}
                    alt={companyData?.companyName?.charAt(0) || 'C'}
                  >
                    <Business sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {companyData?.companyName || 'Set Your Company Name'}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      {/* FIXED: Category icon now imported */}
                      <Category sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} /> {companyData?.industry || 'Industry Not Set'} 
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Chip
                        icon={verification.status === 'verified' ? <Verified /> : <Schedule />}
                        label={verification.label}
                        color={verification.color}
                        size="small"
                        variant="outlined"
                      />
                      {companyData?.trustScore !== undefined && (
                        <Chip
                          icon={<Star />}
                          label={`${companyData.trustScore.toFixed(1)} Trust Score`}
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditProfileDialog(true)}
                  color="primary"
                >
                  Edit Profile
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Contact & Address</Typography>
                  {[
                    { icon: <LocationOn color="action" />, label: 'Address', value: `${companyData?.address || ''}, ${companyData?.city || ''}, ${companyData?.state || ''} - ${companyData?.pincode || ''}`.replace(/,\s*,\s*|^\s*,\s*|,\s*$/g, '').trim() || 'Not specified' },
                    { icon: <Phone color="action" />, label: 'Phone', value: companyData?.phone || 'Not provided' },
                    { icon: <Email color="action" />, label: 'Email', value: companyData?.email || 'Not provided' },
                    { icon: <Language color="action" />, label: 'Website', value: companyData?.website || 'Not provided' }, // FIXED: Language icon now imported
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Tooltip title={item.label} placement="left">
                        {item.icon}
                      </Tooltip>
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1 }}>{item.label}:</Typography>
                        <Typography variant="body1">{item.value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Business Metrics</Typography>
                  {[
                    { label: 'Year Established', value: companyData?.yearEstablished || 'Not specified' },
                    { label: 'Employees', value: companyData?.numberOfEmployees || 'Not specified' },
                    { label: 'Annual Turnover', value: companyData?.annualTurnover || 'Not specified' },
                    { label: 'GST Number', value: companyData?.gstNumber || 'Not provided' },
                    { label: 'PAN Number', value: companyData?.panNumber || 'Not provided' },
                  ].map((item, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1 }}>{item.label}</Typography>
                      <Typography variant="body1">{item.value}</Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>

              {companyData?.description && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Company Description</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {companyData.description}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Credits & Actions */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Lead Credits */}
            <Grid item xs={12}>
              <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #3f51b5 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">Lead Credits</Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                        {companyData?.leadCredits || 0}
                      </Typography>
                    </Box>
                    <CreditCard sx={{ fontSize: 50, opacity: 0.7 }} />
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.3)', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' } }}
                    startIcon={<AttachMoney />}
                    onClick={() => setBuyCreditsDialog(true)}
                  >
                    Buy Credits
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Verification Progress */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Profile Health</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight="medium">Profile Completion</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {profileCompletion}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={profileCompletion}
                      sx={{ height: 10, borderRadius: 5 }}
                      color={profileCompletion < 50 ? 'error' : profileCompletion < 90 ? 'warning' : 'success'}
                    />
                    {profileCompletion < 100 && (
                      <Alert severity="warning" sx={{ mt: 1, p: 0.5 }}>
                        Complete your profile for a higher Trust Score.
                      </Alert>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <VerificationCheck label="Phone Verified" isVerified={companyData?.phoneVerified} />
                    <VerificationCheck label="Email Verified" isVerified={companyData?.emailVerified} />
                    <VerificationCheck label="Documents Uploaded" isVerified={verification.status === 'verified'} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions - Merged into Profile Health Card or keep separate if design needs it */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={() => setUploadDocDialog(true)}
                        fullWidth
                        size="small"
                      >
                        Upload Docs
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        fullWidth
                        size="small"
                        // Add actual link/navigation later
                      >
                        Preview
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        fullWidth
                        size="small"
                        disabled // Placeholder for future feature
                      >
                        Brochure
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        startIcon={<TrendingUp />}
                        fullWidth
                        size="small"
                        onClick={() => setActiveTab(2)}
                      >
                        View Analytics
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const VerificationCheck = ({ label, isVerified }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="body2">{label}</Typography>
      {isVerified ?
        <CheckCircle color="success" fontSize="small" /> :
        <Warning color="warning" fontSize="small" />
      }
    </Box>
  );

  const DocumentsTab = () => (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Company Documents</Typography>
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => setUploadDocDialog(true)}
          >
            Upload Document
          </Button>
        </Box>

        <Grid container spacing={3}>
          {companyData?.documents?.length > 0 ? (
            companyData.documents.map((doc, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Description sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">{doc.type}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={doc.status}
                        color={doc.status === 'verified' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}
                        size="small"
                        icon={doc.status === 'verified' ? <Verified /> : doc.status === 'rejected' ? <Warning /> : <Schedule />}
                      />
                    </Box>
                    {doc.remarks && (
                      <Alert severity={doc.status === 'rejected' ? 'error' : 'info'} sx={{ mt: 2 }}>
                        **Admin Remarks:** {doc.remarks}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, border: '2px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
                <Description sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No documents uploaded yet
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Upload your mandatory documents (GST, PAN etc.) to increase your Trust Score and get **Fully Verified**.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  onClick={() => setUploadDocDialog(true)}
                >
                  Start Uploading
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  const AnalyticsTab = () => (
    <Grid container spacing={3}>
      {/* Key Metrics Cards */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {[
            { title: 'Profile Views (30 Days)', value: analytics?.profileViews || 0, icon: <Visibility />, color: 'primary' },
            { title: 'New RFQs Received', value: analytics?.rfqsReceived || 0, icon: <Description />, color: 'success' },
            { title: 'Quotes Submitted', value: analytics?.quotesSubmitted || 0, icon: <Upload />, color: 'warning' },
            { title: 'Estimated Revenue', value: formatCurrency(analytics?.totalRevenue || 0), icon: <AttachMoney />, color: 'error' },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={1}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" color={`${item.color}.main`} fontWeight="bold">
                        {item.value}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">{item.title}</Typography>
                    </Box>
                    {React.cloneElement(item.icon, { sx: { fontSize: 40, color: `${item.color}.light` } })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Chart Placeholders */}
      <Grid item xs={12} md={6}>
        <PlaceholderChart title="Profile Views Trend" data={[]} color="primary" />
      </Grid>
      <Grid item xs={12} md={6}>
        <PlaceholderChart title="Quotes Submitted vs. RFQs Received" data={[]} color="success" />
      </Grid>

      {/* Detailed Report Link */}
      <Grid item xs={12}>
        <Alert severity="info">
          This is a snapshot. For deeper analysis, heatmaps, and trend reports, please visit the dedicated **Analytics** page.
        </Alert>
      </Grid>
    </Grid>
  );
  // --- End Components for Tabs ---


  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Company Data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        My Company Dashboard 👋
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }} elevation={3}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} centered variant="fullWidth">
          <Tab label="Overview" icon={<Business />} />
          <Tab label="Documents" icon={<Description />} />
          <Tab label="Analytics" icon={<Analytics />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ p: 2 }}>
        {activeTab === 0 && <CompanyOverview />}
        {activeTab === 1 && <DocumentsTab />}
        {activeTab === 2 && <AnalyticsTab />}
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialog} onClose={() => setEditProfileDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Company Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>

            {/* Logo Upload Section */}
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 100, height: 100, mr: 3, bgcolor: 'primary.light', border: '2px solid' }}
                src={logoFile ? URL.createObjectURL(logoFile) : profileForm.logo}
                alt={profileForm.companyName?.charAt(0) || 'C'}
              >
                <Business sx={{ fontSize: 50 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Company Logo</Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload-button"
                  type="file"
                  onChange={handleLogoUpload}
                />
                <label htmlFor="logo-upload-button">
                  <Button variant="outlined" component="span" startIcon={<PhotoCamera />} size="small" sx={{ mt: 1 }}>
                    Upload New Logo
                  </Button>
                </label>
                {logoFile && (
                  <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                    {logoFile.name} ready to upload.
                  </Typography>
                )}
                <Typography variant="caption" display="block" color="textSecondary">
                  Max size 2MB (JPG, PNG).
                </Typography>
              </Box>
            </Grid>

            {/* Profile Fields */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Company Name"
                fullWidth
                value={profileForm.companyName}
                onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={profileForm.industry}
                  label="Industry"
                  onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                >
                  {industries.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Year Established"
                fullWidth
                type="number"
                value={profileForm.yearEstablished}
                onChange={(e) => setProfileForm({ ...profileForm, yearEstablished: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Number of Employees</InputLabel>
                <Select
                  value={profileForm.numberOfEmployees}
                  label="Number of Employees"
                  onChange={(e) => setProfileForm({ ...profileForm, numberOfEmployees: e.target.value })}
                >
                  {employeeRanges.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Annual Turnover</InputLabel>
                <Select
                  value={profileForm.annualTurnover}
                  label="Annual Turnover"
                  onChange={(e) => setProfileForm({ ...profileForm, annualTurnover: e.target.value })}
                >
                  {turnoverRanges.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Website URL"
                fullWidth
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Company Description (Max 500 characters)"
                fullWidth
                multiline
                rows={3}
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="GST Number"
                fullWidth
                value={profileForm.gstNumber}
                onChange={(e) => setProfileForm({ ...profileForm, gstNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="PAN Number"
                fullWidth
                value={profileForm.panNumber}
                onChange={(e) => setProfileForm({ ...profileForm, panNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Phone Number"
                fullWidth
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Company Email"
                fullWidth
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </Grid>

            {/* Address Fields */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>Address</Divider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Street Address / Locality"
                fullWidth
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="City"
                fullWidth
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={profileForm.state}
                  label="State"
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                >
                  {states.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Pincode"
                fullWidth
                value={profileForm.pincode}
                onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileDialog(false)} color="secondary" disabled={dialogLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProfile}
            variant="contained"
            color="primary"
            disabled={dialogLoading}
            startIcon={dialogLoading && <CircularProgress size={20} color="inherit" />}
          >
            {dialogLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDocDialog} onClose={() => setUploadDocDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Company Document</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Mandatory documents (GST, PAN) help increase your Trust Score. Max file size 5MB (PDF/JPG/PNG).
          </Alert>
          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={documentType}
              label="Document Type"
              onChange={(e) => setDocumentType(e.target.value)}
            >
              {documentTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ border: '2px dashed', borderColor: 'grey.300', p: 3, textAlign: 'center' }}>
            <input
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="document-upload-button"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="document-upload-button">
              <Button variant="outlined" component="span" startIcon={<Upload />}>
                {selectedFile ? `Change File: ${selectedFile.name}` : 'Select Document File'}
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                File selected: **{selectedFile.name}**
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDocDialog(false)} color="secondary" disabled={dialogLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDocumentUpload}
            variant="contained"
            color="primary"
            disabled={dialogLoading || !selectedFile || !documentType}
            startIcon={dialogLoading && <CircularProgress size={20} color="inherit" />}
          >
            {dialogLoading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Buy Credits Dialog */}
      <Dialog open={buyCreditsDialog} onClose={() => setBuyCreditsDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Buy Lead Credits</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Credits are used to access contact details for new RFQ leads. 1 Credit = ₹1. Minimum purchase is 10 Credits.
          </Alert>
          <TextField
            label="Credits Amount (Min 10)"
            fullWidth
            type="number"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            inputProps={{ min: 10 }}
            sx={{ mb: 2 }}
            required
          />
          <Typography variant="h6" sx={{ textAlign: 'right' }}>
            Total Payment: **{formatCurrency(parseInt(creditAmount) || 0)}**
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyCreditsDialog(false)} color="secondary" disabled={dialogLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleBuyCredits}
            variant="contained"
            color="primary"
            disabled={dialogLoading || parseInt(creditAmount) < 10}
            startIcon={dialogLoading && <CircularProgress size={20} color="inherit" />}
          >
            {dialogLoading ? 'Processing...' : `Pay ${formatCurrency(parseInt(creditAmount) || 0)}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyDashboard;