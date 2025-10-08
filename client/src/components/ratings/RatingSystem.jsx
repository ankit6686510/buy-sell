import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Alert,
  LinearProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  Flag,
  Reply,
  MoreVert,
  Verified,
  BusinessCenter,
  Schedule,
  FilterList
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import api from '../../services/api';

const RatingSystem = ({ 
  targetId, 
  targetType = 'user', // 'user' or 'company'
  showAddRating = true,
  compact = false 
}) => {
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dialog states
  const [addRatingDialog, setAddRatingDialog] = useState(false);
  const [replyDialog, setReplyDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  
  // Form states
  const [newRating, setNewRating] = useState({
    rating: 0,
    review: '',
    category: 'overall',
    transactionId: ''
  });
  const [replyText, setReplyText] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    rating: 'all',
    category: 'all',
    sortBy: 'newest'
  });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { user } = useSelector(state => state.auth);

  const ratingCategories = [
    { value: 'overall', label: 'Overall Experience' },
    { value: 'quality', label: 'Product Quality' },
    { value: 'delivery', label: 'Delivery Time' },
    { value: 'communication', label: 'Communication' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'professionalism', label: 'Professionalism' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
    { value: 'helpful', label: 'Most Helpful' }
  ];

  useEffect(() => {
    loadRatings();
    loadRatingSummary();
  }, [targetId, page, filters]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });
      
      const response = await api.get(`/api/ratings/${targetType}/${targetId}?${params}`);
      setRatings(response.data.ratings);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Load ratings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRatingSummary = async () => {
    try {
      const response = await api.get(`/api/ratings/${targetType}/${targetId}/summary`);
      setRatingSummary(response.data);
    } catch (err) {
      console.error('Load rating summary error:', err);
    }
  };

  const handleSubmitRating = async () => {
    try {
      if (!newRating.rating || !newRating.review.trim()) {
        showSnackbar('Please provide both rating and review', 'error');
        return;
      }

      const response = await api.post('/api/ratings', {
        ...newRating,
        targetId,
        targetType
      });

      if (response.data.success) {
        showSnackbar('Rating submitted successfully!', 'success');
        setAddRatingDialog(false);
        setNewRating({
          rating: 0,
          review: '',
          category: 'overall',
          transactionId: ''
        });
        loadRatings();
        loadRatingSummary();
      }
    } catch (err) {
      showSnackbar('Failed to submit rating', 'error');
      console.error('Submit rating error:', err);
    }
  };

  const handleVoteRating = async (ratingId, voteType) => {
    try {
      await api.post(`/api/ratings/${ratingId}/vote`, { voteType });
      loadRatings();
    } catch (err) {
      console.error('Vote rating error:', err);
    }
  };

  const handleReplyToRating = async () => {
    try {
      if (!replyText.trim()) {
        showSnackbar('Please enter a reply', 'error');
        return;
      }

      const response = await api.post(`/api/ratings/${selectedRating._id}/reply`, {
        response: replyText
      });

      if (response.data.success) {
        showSnackbar('Reply added successfully!', 'success');
        setReplyDialog(false);
        setReplyText('');
        setSelectedRating(null);
        loadRatings();
      }
    } catch (err) {
      showSnackbar('Failed to add reply', 'error');
      console.error('Reply rating error:', err);
    }
  };

  const handleFlagRating = async (ratingId, reason) => {
    try {
      await api.post(`/api/ratings/${ratingId}/flag`, { reason });
      showSnackbar('Rating flagged for review', 'success');
    } catch (err) {
      console.error('Flag rating error:', err);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const RatingSummaryCard = () => {
    if (!ratingSummary) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" component="div" color="primary">
                  {ratingSummary.averageRating?.toFixed(1) || 0}
                </Typography>
                <Rating 
                  value={ratingSummary.averageRating || 0} 
                  readOnly 
                  size="large"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Based on {ratingSummary.totalRatings} reviews
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Rating Breakdown</Typography>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 20 }}>
                    {rating}
                  </Typography>
                  <Star fontSize="small" sx={{ mx: 1, color: 'gold' }} />
                  <LinearProgress
                    variant="determinate"
                    value={((ratingSummary.ratingDistribution?.[rating] || 0) / ratingSummary.totalRatings) * 100}
                    sx={{ flexGrow: 1, mx: 2, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 30 }}>
                    {ratingSummary.ratingDistribution?.[rating] || 0}
                  </Typography>
                </Box>
              ))}
              
              {ratingSummary.categoryAverages && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Category Ratings</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(ratingSummary.categoryAverages).map(([category, avg]) => (
                      <Grid item xs={6} md={4} key={category}>
                        <Box sx={{ textAlign: 'center', p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {ratingCategories.find(cat => cat.value === category)?.label || category}
                          </Typography>
                          <Rating value={avg} readOnly size="small" />
                          <Typography variant="caption" display="block">
                            {avg.toFixed(1)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const RatingCard = ({ rating }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2 }} src={rating.user?.profilePicture}>
              {rating.user?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">
                  {rating.user?.name || 'Anonymous'}
                </Typography>
                {rating.user?.verified && (
                  <Verified color="primary" fontSize="small" />
                )}
                {rating.category !== 'overall' && (
                  <Chip
                    label={ratingCategories.find(cat => cat.value === rating.category)?.label}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Rating value={rating.rating} readOnly size="small" />
                <Typography variant="caption" color="textSecondary">
                  {format(new Date(rating.createdAt), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {rating.review}
        </Typography>

        {rating.response && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            borderLeft: 4,
            borderColor: 'primary.main'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessCenter fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Response from Business</Typography>
            </Box>
            <Typography variant="body2">
              {rating.response.response}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {format(new Date(rating.response.createdAt), 'MMM dd, yyyy')}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<ThumbUp />}
              onClick={() => handleVoteRating(rating._id, 'up')}
              color={rating.userVote === 'up' ? 'primary' : 'inherit'}
            >
              {rating.helpfulVotes || 0}
            </Button>
            <Button
              size="small"
              startIcon={<ThumbDown />}
              onClick={() => handleVoteRating(rating._id, 'down')}
              color={rating.userVote === 'down' ? 'error' : 'inherit'}
            >
              {rating.notHelpfulVotes || 0}
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!rating.response && targetType === 'company' && (
              <Button
                size="small"
                startIcon={<Reply />}
                onClick={() => {
                  setSelectedRating(rating);
                  setReplyDialog(true);
                }}
              >
                Reply
              </Button>
            )}
            <Button
              size="small"
              startIcon={<Flag />}
              onClick={() => handleFlagRating(rating._id, 'inappropriate')}
            >
              Report
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (compact) {
    return (
      <Box>
        {ratingSummary && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Rating value={ratingSummary.averageRating || 0} readOnly />
            <Typography variant="body2">
              {ratingSummary.averageRating?.toFixed(1)} ({ratingSummary.totalRatings} reviews)
            </Typography>
          </Box>
        )}
        {showAddRating && (
          <Button
            variant="outlined"
            startIcon={<Star />}
            onClick={() => setAddRatingDialog(true)}
            size="small"
          >
            Write Review
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <RatingSummaryCard />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList />
            <Typography variant="h6">Filters & Actions</Typography>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Rating</InputLabel>
                <Select
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: e.target.value})}
                  label="Rating"
                >
                  <MenuItem value="all">All Ratings</MenuItem>
                  <MenuItem value="5">5 Stars</MenuItem>
                  <MenuItem value="4">4 Stars</MenuItem>
                  <MenuItem value="3">3 Stars</MenuItem>
                  <MenuItem value="2">2 Stars</MenuItem>
                  <MenuItem value="1">1 Star</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {ratingCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  label="Sort By"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {showAddRating && (
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  startIcon={<Star />}
                  onClick={() => setAddRatingDialog(true)}
                  fullWidth
                >
                  Write Review
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Ratings List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : ratings.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Star sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No reviews yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Be the first to write a review!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {ratings.map((rating) => (
            <RatingCard key={rating._id} rating={rating} />
          ))}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Add Rating Dialog */}
      <Dialog open={addRatingDialog} onClose={() => setAddRatingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newRating.category}
                  onChange={(e) => setNewRating({...newRating, category: e.target.value})}
                  label="Category"
                >
                  {ratingCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transaction ID (Optional)"
                value={newRating.transactionId}
                onChange={(e) => setNewRating({...newRating, transactionId: e.target.value})}
                helperText="Link this review to a specific transaction"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography component="legend">Rating *</Typography>
              <Rating
                value={newRating.rating}
                onChange={(e, value) => setNewRating({...newRating, rating: value})}
                size="large"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Review *"
                value={newRating.review}
                onChange={(e) => setNewRating({...newRating, review: e.target.value})}
                placeholder="Share your experience..."
                helperText="Write a detailed review to help others"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddRatingDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitRating} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Review</DialogTitle>
        <DialogContent>
          {selectedRating && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={selectedRating.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  by {selectedRating.user?.name}
                </Typography>
              </Box>
              <Typography variant="body2">
                {selectedRating.review}
              </Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Response"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a professional response..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(false)}>Cancel</Button>
          <Button onClick={handleReplyToRating} variant="contained">
            Post Reply
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

export default RatingSystem;
