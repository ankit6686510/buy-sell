import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  RequestQuote,
  Visibility,
  Schedule,
  LocationOn,
  CurrencyRupee,
  Business,
  Star,
  FilterList,
  Refresh,
  Send,
  AttachMoney,
  Warning,
  CheckCircle,
  AccessTime,
  TrendingUp
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

const SupplierQuoteDashboard = ({ 
  rfqs = [], 
  myQuotes = [], 
  onSubmitQuote, 
  onViewRFQ,
  loading = false,
  leadCredits = 0,
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [quoteDialog, setQuoteDialog] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    budgetRange: '',
    location: '',
    sortBy: 'newest'
  });
  const [quoteForm, setQuoteForm] = useState({
    pricePerUnit: '',
    totalPrice: '',
    deliveryTime: '',
    deliveryTerms: '',
    paymentTerms: '',
    validityPeriod: '30 days',
    message: '',
    variants: []
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const categories = [
    'Consumer Electronics',
    'Home Appliances',
    'Electrical Components',
    'Lighting',
    'Industrial Equipment',
    'Mobile & Accessories',
    'Computers & Laptops'
  ];

  const budgetRanges = [
    { label: 'Under ₹50K', value: '0-50000' },
    { label: '₹50K - ₹2L', value: '50000-200000' },
    { label: '₹2L - ₹10L', value: '200000-1000000' },
    { label: 'Above ₹10L', value: '1000000-999999999' }
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Budget: High to Low', value: 'budget_high' },
    { label: 'Budget: Low to High', value: 'budget_low' },
    { label: 'Expiring Soon', value: 'expiring_soon' },
    { label: 'Most Viewed', value: 'most_viewed' }
  ];

  useEffect(() => {
    if (selectedRFQ && quoteDialog) {
      // Auto-calculate total price when price per unit or quantity changes
      if (quoteForm.pricePerUnit && selectedRFQ.quantity) {
        const total = parseFloat(quoteForm.pricePerUnit) * selectedRFQ.quantity;
        setQuoteForm(prev => ({ ...prev, totalPrice: total.toString() }));
      }
    }
  }, [quoteForm.pricePerUnit, selectedRFQ?.quantity, quoteDialog]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewRFQ = (rfq) => {
    setSelectedRFQ(rfq);
    onViewRFQ && onViewRFQ(rfq._id);
  };

  const handleQuoteClick = (rfq) => {
    setSelectedRFQ(rfq);
    setQuoteForm({
      pricePerUnit: '',
      totalPrice: '',
      deliveryTime: '',
      deliveryTerms: '',
      paymentTerms: '',
      validityPeriod: '30 days',
      message: '',
      variants: []
    });
    setQuoteDialog(true);
  };

  const handleSubmitQuote = async () => {
    if (!quoteForm.pricePerUnit || !quoteForm.totalPrice || !quoteForm.deliveryTime) {
      return;
    }

    setSubmittingQuote(true);
    try {
      await onSubmitQuote(selectedRFQ._id, quoteForm);
      setQuoteDialog(false);
      setSelectedRFQ(null);
    } catch (error) {
      console.error('Error submitting quote:', error);
    }
    setSubmittingQuote(false);
  };

  const formatCurrency = (amount) => {
    return `₹${parseInt(amount).toLocaleString()}`;
  };

  const getRFQPriority = (rfq) => {
    if (rfq.urgent) return 'urgent';
    if (rfq.featured) return 'featured';
    const daysLeft = Math.ceil((new Date(rfq.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 2) return 'expiring';
    return 'normal';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'featured': return 'primary';
      case 'expiring': return 'warning';
      default: return 'default';
    }
  };

  const getQuoteStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'info';
      case 'shortlisted': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'awarded': return 'success';
      default: return 'default';
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    if (filters.category && rfq.category !== filters.category) return false;
    if (filters.location && !rfq.deliveryLocation.city.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.budgetRange) {
      const [min, max] = filters.budgetRange.split('-').map(Number);
      if (rfq.budgetRange.max < min || rfq.budgetRange.min > max) return false;
    }
    return true;
  });

  const RFQCard = ({ rfq, showQuoteButton = true }) => {
    const priority = getRFQPriority(rfq);
    const daysLeft = Math.ceil((new Date(rfq.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    const hasQuoted = myQuotes.some(quote => quote._id === rfq._id);

    return (
      <Card sx={{ mb: 2, border: priority === 'urgent' ? '2px solid' : '1px solid', borderColor: priority === 'urgent' ? 'error.main' : 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" component="h3">
                  {rfq.title}
                </Typography>
                {priority !== 'normal' && (
                  <Chip
                    size="small"
                    label={priority === 'urgent' ? 'URGENT' : priority === 'featured' ? 'FEATURED' : 'EXPIRES SOON'}
                    color={getPriorityColor(priority)}
                  />
                )}
                {hasQuoted && (
                  <Chip size="small" label="QUOTED" color="success" variant="outlined" />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {rfq.description.substring(0, 150)}...
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CurrencyRupee fontSize="small" color="primary" />
                    <Typography variant="body2">
                      <strong>Budget:</strong> {formatCurrency(rfq.budgetRange.min)} - {formatCurrency(rfq.budgetRange.max)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Business fontSize="small" color="primary" />
                    <Typography variant="body2">
                      <strong>Quantity:</strong> {rfq.quantity} {rfq.unit}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn fontSize="small" color="primary" />
                    <Typography variant="body2">
                      <strong>Location:</strong> {rfq.deliveryLocation.city}, {rfq.deliveryLocation.state}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Schedule fontSize="small" color="primary" />
                    <Typography variant="body2">
                      <strong>Delivery:</strong> {format(new Date(rfq.expectedDelivery), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Chip label={rfq.category} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  <Visibility fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  {rfq.metrics?.views || 0} views
                </Typography>
                <Typography variant="caption" color={daysLeft <= 2 ? 'error.main' : 'text.secondary'}>
                  <AccessTime fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                {rfq.buyer?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {rfq.buyer?.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star fontSize="small" color="warning" />
                  <Typography variant="caption">
                    {rfq.buyer?.trustScore || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => handleViewRFQ(rfq)}
          >
            View Details
          </Button>
          
          {showQuoteButton && !hasQuoted && daysLeft > 0 && (
            <Button
              variant="contained"
              startIcon={<RequestQuote />}
              onClick={() => handleQuoteClick(rfq)}
              disabled={leadCredits < 1}
            >
              Submit Quote (1 Credit)
            </Button>
          )}
          
          {hasQuoted && (
            <Button variant="outlined" color="success" startIcon={<CheckCircle />}>
              Quote Submitted
            </Button>
          )}
          
          {leadCredits < 1 && !hasQuoted && showQuoteButton && (
            <Tooltip title="Insufficient lead credits">
              <span>
                <Button variant="outlined" startIcon={<Warning />} disabled>
                  Need Credits
                </Button>
              </span>
            </Tooltip>
          )}
        </CardActions>
      </Card>
    );
  };

  const QuoteCard = ({ quote }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {quote.title}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  <strong>Your Quote:</strong> {formatCurrency(quote.quote.totalPrice)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Per Unit:</strong> {formatCurrency(quote.quote.pricePerUnit)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Delivery:</strong> {quote.quote.deliveryTime}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  <strong>Buyer Budget:</strong> {formatCurrency(quote.budgetRange.min)} - {formatCurrency(quote.budgetRange.max)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong>
                  <Chip
                    size="small"
                    label={quote.quote.status.toUpperCase()}
                    color={getQuoteStatusColor(quote.quote.status)}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Submitted {formatDistanceToNow(new Date(quote.quote.submittedAt))} ago
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            RFQ Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={leadCredits} color="primary">
              <Chip
                icon={<AttachMoney />}
                label={`${leadCredits} Credits`}
                color={leadCredits > 5 ? 'success' : leadCredits > 0 ? 'warning' : 'error'}
                variant="outlined"
              />
            </Badge>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Find and quote on electronics & electrical requirements from verified buyers
        </Typography>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Available RFQs
                <Badge badgeContent={filteredRFQs.length} color="primary" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RequestQuote />
                My Quotes
                <Badge badgeContent={myQuotes.length} color="primary" />
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Filters */}
      {activeTab === 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList />
            <Typography variant="subtitle1">Filters</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Budget Range</InputLabel>
                <Select
                  value={filters.budgetRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
                  label="Budget Range"
                >
                  <MenuItem value="">All Budgets</MenuItem>
                  {budgetRanges.map(range => (
                    <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City or State"
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  label="Sort By"
                >
                  {sortOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 && (
            <Box>
              {leadCredits === 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>No lead credits remaining!</strong> Purchase credits to submit quotes and connect with buyers.
                  </Typography>
                </Alert>
              )}
              
              {filteredRFQs.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No RFQs found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or check back later for new requirements.
                  </Typography>
                </Paper>
              ) : (
                filteredRFQs.map(rfq => (
                  <RFQCard key={rfq._id} rfq={rfq} />
                ))
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {myQuotes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No quotes submitted yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submit quotes on available RFQs to connect with buyers.
                  </Typography>
                </Paper>
              ) : (
                myQuotes.map(quote => (
                  <QuoteCard key={quote._id} quote={quote} />
                ))
              )}
            </Box>
          )}
        </>
      )}

      {/* Quote Submission Dialog */}
      <Dialog 
        open={quoteDialog} 
        onClose={() => setQuoteDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submit Quote
          {selectedRFQ && (
            <Typography variant="body2" color="text.secondary">
              for "{selectedRFQ.title}"
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedRFQ && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Requirement:</strong> {selectedRFQ.quantity} {selectedRFQ.unit} • 
                  <strong> Budget:</strong> {formatCurrency(selectedRFQ.budgetRange.min)} - {formatCurrency(selectedRFQ.budgetRange.max)} • 
                  <strong> 1 Lead Credit</strong> will be deducted upon submission
                </Typography>
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Price Per Unit (₹) *"
                    type="number"
                    value={quoteForm.pricePerUnit}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total Price (₹) *"
                    type="number"
                    value={quoteForm.totalPrice}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, totalPrice: e.target.value }))}
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText={quoteForm.pricePerUnit ? `Auto-calculated: ₹${(parseFloat(quoteForm.pricePerUnit) * selectedRFQ.quantity).toLocaleString()}` : ''}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Delivery Time *"
                    value={quoteForm.deliveryTime}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, deliveryTime: e.target.value }))}
                    placeholder="e.g., 7-10 days, 2 weeks"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quote Validity"
                    value={quoteForm.validityPeriod}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, validityPeriod: e.target.value }))}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payment Terms"
                    value={quoteForm.paymentTerms}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    placeholder="e.g., 50% advance, 50% on delivery"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Delivery Terms"
                    value={quoteForm.deliveryTerms}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                    placeholder="e.g., FOB, CIF, Door delivery"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Message"
                    value={quoteForm.message}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Any additional information about your offer, product specifications, or terms..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setQuoteDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitQuote}
            disabled={submittingQuote || !quoteForm.pricePerUnit || !quoteForm.totalPrice || !quoteForm.deliveryTime}
            startIcon={submittingQuote ? <CircularProgress size={20} /> : <Send />}
          >
            {submittingQuote ? 'Submitting...' : 'Submit Quote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierQuoteDashboard;
