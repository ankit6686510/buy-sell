import { useState, useEffect } from 'react';
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
  Badge,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Business,
  Edit,
  Verified,
  Star,
  TrendingUp,
  People,
  AttachMoney,
  Upload,
  Download,
  Visibility,
  CreditCard,
  LocalOffer,
  Analytics,
  Settings,
  PhotoCamera,
  Description,
  LocationOn,
  Phone,
  Email,
  Language,
  Category,
  CheckCircle,
  Schedule,
  Warning
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../services/api';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [companyData, setCompanyData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
    annualTurnover: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  
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

  useEffect(() => {
    loadCompanyData();
    loadAnalytics();
  }, []);

  const loadCompanyData = async () => {
    try {
      const response = await api.get('/api/companies/my-profile');
      setCompanyData(response.data.company);
      if (response.data.company) {
        setProfileForm(response.data.company);
      }
    } catch (err) {
      setError('Failed to load company data');
      console.error('Company data error:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/api/companies/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/api/companies/profile', profileForm);
      
      if (response.data.success) {
        setCompanyData(response.data.company);
        setEditProfileDialog(false);
        showSnackbar('Company profile updated successfully!', 'success');
      }
    } catch (err) {
      showSnackbar('Failed to update profile', 'error');
      console.error('Update profile error:', err);
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

  const handleDocumentUpload = async () => {
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
        showSnackbar('Document uploaded successfully!', 'success');
        setUploadDocDialog(false);
        setSelectedFile(null);
        setDocumentType('');
        loadCompanyData();
      }
    } catch (err) {
      showSnackbar('Failed to upload document', 'error');
      console.error('Document upload error:', err);
    }
  };

  const handleBuyCredits = async () => {
    try {
      if (!creditAmount || parseInt(creditAmount) < 10) {
        showSnackbar('Minimum credit purchase is 10 credits', 'error');
        return;
      }

      const response = await api.post('/api/companies/buy-credits', {
        credits: parseInt(creditAmount)
      });

      if (response.data.success) {
        // Open Razorpay for payment
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: response.data.order.amount,
          currency: 'INR',
          name: 'BudMatching',
          description: 'Lead Credits Purchase',
          order_id: response.data.order.id,
          handler: async function (razorpayResponse) {
            try {
              await api.post('/api/payments/verify', {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                type: 'credits'
              });
              
              showSnackbar('Credits purchased successfully!', 'success');
              setBuyCreditsDialog(false);
              setCreditAmount('');
              loadCompanyData();
            } catch (error) {
              showSnackbar('Payment verification failed', 'error');
            }
          },
          prefill: {
            name: companyData?.companyName || user?.name,
            email: companyData?.email || user?.email,
            contact: companyData?.phone || user?.phone
          },
          theme: {
            color: '#1976d2'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err) {
      showSnackbar('Failed to initiate payment', 'error');
      console.error('Buy credits error:', err);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getVerificationStatus = (documents) => {
    if (!documents || documents.length === 0) return { status: 'pending', label: 'Pending', color: 'warning' };
    
    const verified = documents.filter(doc => doc.status === 'verified').length;
    const total = documents.length;
    
    if (verified === total) return { status: 'verified', label: 'Verified', color: 'success' };
    if (verified > 0) return { status: 'partial', label: 'Partial', color: 'info' };
    return { status: 'pending', label: 'Pending', color: 'warning' };
  };

  const CompanyOverview = () => {
    const verification = getVerificationStatus(companyData?.documents);
    
    return (
      <Grid container spacing={3}>
        {/* Company Profile Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{ width: 80, height: 80, mr: 3 }}
                    src={companyData?.logo}
                  >
                    <Business sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {companyData?.companyName || 'Company Name'}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      {companyData?.industry || 'Industry'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={verification.status === 'verified' ? <Verified /> : <Schedule />}
                        label={verification.label}
                        color={verification.color}
                        size="small"
                      />
                      {companyData?.trustScore && (
                        <Chip
                          icon={<Star />}
                          label={`${companyData.trustScore} Trust Score`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditProfileDialog(true)}
                >
                  Edit Profile
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Company Details</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Location</Typography>
                    <Typography variant="body1">
                      {companyData?.city}, {companyData?.state}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Established</Typography>
                    <Typography variant="body1">
                      {companyData?.yearEstablished || 'Not specified'}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Employees</Typography>
                    <Typography variant="body1">
                      {companyData?.numberOfEmployees || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Phone</Typography>
                    <Typography variant="body1">
                      {companyData?.phone || 'Not provided'}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">
                      {companyData?.email || 'Not provided'}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Website</Typography>
                    <Typography variant="body1">
                      {companyData?.website || 'Not provided'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {companyData?.description && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>About Company</Typography>
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
          <Grid container spacing={2}>
            {/* Lead Credits */}
            <Grid item xs={12}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CreditCard sx={{ fontSize: 30, mr: 2 }} />
                    <Box>
                      <Typography variant="h6">Lead Credits</Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {companyData?.leadCredits || 0}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                    startIcon={<AttachMoney />}
                    onClick={() => setBuyCreditsDialog(true)}
                  >
                    Buy Credits
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Upload />}
                      onClick={() => setUploadDocDialog(true)}
                      size="small"
                    >
                      Upload Documents
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      size="small"
                    >
                      Preview Profile
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      size="small"
                    >
                      Download Brochure
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Verification Progress */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Verification Status</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Profile Completion</Typography>
                      <Typography variant="body2">
                        {Math.round(((companyData?.profileCompleteness || 0) * 100))}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(companyData?.profileCompleteness || 0) * 100} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Phone Verified</Typography>
                      {companyData?.phoneVerified ? 
                        <CheckCircle color="success" fontSize="small" /> : 
                        <Warning color="warning" fontSize="small" />
                      }
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Email Verified</Typography>
                      {companyData?.emailVerified ? 
                        <CheckCircle color="success" fontSize="small" /> : 
                        <Warning color="warning" fontSize="small" />
                      }
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Documents</Typography>
                      {verification.status === 'verified' ? 
                        <CheckCircle color="success" fontSize="small" /> : 
                        <Warning color="warning" fontSize="small" />
                      }
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Analytics Overview */}
        {analytics && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Performance Overview</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {analytics.profileViews || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Profile Views
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {analytics.rfqsReceived || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        RFQs Received
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {analytics.quotesSubmitted || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Quotes Submitted
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {formatCurrency(analytics.totalRevenue || 0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Revenue
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  const DocumentsTab = () => (
    <Card>
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

        <Grid container spacing={2}>
          {companyData?.documents?.map((doc, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Description sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle2">{doc.type}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={doc.status}
                      color={doc.status === 'verified' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}
                      size="small"
                    />
                  </Box>
                  {doc.remarks && (
                    <Typography variant="body2" sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      {doc.remarks}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {(!companyData?.documents || companyData.documents.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Description sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No documents uploaded
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Upload your company documents to get verified faster
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Company Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Overview" icon={<Business />} />
          <Tab label="Documents" icon={<Description />} />
          <Tab label="Analytics" icon={<Analytics />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && <CompanyOverview />}
      {activeTab === 1 && <DocumentsTab />}
      {activeTab === 2 && (
        <Alert severity="info">
          Detailed analytics will be available here. Connect with the Analytics page for comprehensive data.
        </Alert>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialog} onClose={() => setEditProfileDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Company Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={profileForm.companyName}
                onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={profileForm.industry}
                  onChange={(e) => setProfileForm({...profileForm, industry: e.target.value})}
                  label="Industry"
                >
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Company Description"
                value={profileForm.description}
                onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={profileForm.website}
                onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Year Established"
                type="number"
                value={profileForm.yearEstablished}
                onChange={(e) => setProfileForm({...profileForm, yearEstablished: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Number of Employees</InputLabel>
                <Select
                  value={profileForm.numberOfEmployees}
                  onChange={(e) => setProfileForm({...profileForm, numberOfEmployees: e.target.value})}
                  label="Number of Employees"
                >
                  {employeeRanges.map((range) => (
                    <MenuItem key={range} value={range}>{range}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Annual Turnover</InputLabel>
                <Select
                  value={profileForm.annualTurnover}
                  onChange={(e) => setProfileForm({...profileForm, annualTurnover: e.target.value})}
                  label="Annual Turnover"
                >
                  {turnoverRanges.map((range) => (
                    <MenuItem key={range} value={range}>{range}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained">
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDocDialog} onClose={() => setUploadDocDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              label="Document Type"
            >
              {documentTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <input
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            id="document-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="document-upload">
            <Button variant="outlined" component="span" fullWidth sx={{ mb: 2 }}>
              <PhotoCamera sx={{ mr: 1 }} />
              Choose File
            </Button>
          </label>
          
          {selectedFile && (
            <Typography variant="body2" color="textSecondary">
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDocDialog(false)}>Cancel</Button>
          <Button onClick={handleDocumentUpload} variant="contained" disabled={!selectedFile || !documentType}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Buy Credits Dialog */}
      <Dialog open={buyCreditsDialog} onClose={() => setBuyCreditsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Purchase Lead Credits</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Lead credits are used to submit quotes on RFQs. Each quote submission costs 1 credit.
            <br />Price: ₹25 per credit
          </Alert>
          
          <TextField
            fullWidth
            label="Number of Credits"
            type="number"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            inputProps={{ min: 10 }}
            helperText="Minimum purchase: 10 credits"
            sx={{ mb: 2 }}
          />
          
          {creditAmount && (
            <Typography variant="h6" color="primary">
              Total Amount: {formatCurrency(parseInt(creditAmount || 0) * 25)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyCreditsDialog(false)}>Cancel</Button>
          <Button onClick={handleBuyCredits} variant="contained" disabled={!creditAmount}>
            Purchase Credits
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyDashboard;
