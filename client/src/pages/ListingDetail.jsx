import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  LocationOn,
  ArrowBack,
  Message,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

import { 
  getListingById, 
  addFavorite, 
  removeFavorite,
  deleteListing 
} from '../services/listingService';
import { startChat } from '../services/messageService';
import { 
  fetchListingStart, 
  fetchListingSuccess, 
  fetchListingFailure,
  toggleFavoriteStart,
  toggleFavoriteSuccess,
  toggleFavoriteFailure,
  deleteListingStart,
  deleteListingSuccess,
  deleteListingFailure
} from '../store/slices/listingSlice';
import { addChatSuccess } from '../store/slices/messageSlice';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { listing, loading, error } = useSelector((state) => state.listings);
  const { user } = useSelector((state) => state.auth);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        dispatch(fetchListingStart());
        const data = await getListingById(id);
        dispatch(fetchListingSuccess(data.listing));
      } catch (err) {
        dispatch(fetchListingFailure(err.message || 'Failed to load listing'));
      }
    };
    
    fetchListing();
  }, [id, dispatch]);
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? listing.images.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === listing.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${id}` } });
      return;
    }
    
    try {
      setProcessingAction(true);
      setActionError(null);
      dispatch(toggleFavoriteStart());
      
      let response;
      const isFavorite = user.favorites?.includes(id);
      
      if (isFavorite) {
        response = await removeFavorite(id);
        setSuccessMessage('Removed from favorites');
      } else {
        response = await addFavorite(id);
        setSuccessMessage('Added to favorites');
      }
      
      dispatch(toggleFavoriteSuccess({ listingId: id, isFavorite: !isFavorite }));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      dispatch(toggleFavoriteFailure(err.message || 'Failed to update favorites'));
      setActionError(err.message || 'Failed to update favorites');
    } finally {
      setProcessingAction(false);
    }
  };
  
  const handleContactSeller = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${id}` } });
      return;
    }
    
    if (listing.user._id === user._id) {
      setActionError("You can't message yourself");
      setTimeout(() => setActionError(null), 3000);
      return;
    }
    
    try {
      setProcessingAction(true);
      setActionError(null);
      
      const response = await startChat(
        listing.user._id,
        id,
        `Hi, I'm interested in your ${listing.brand} ${listing.model} earbud.`
      );
      
      dispatch(addChatSuccess(response.chat));
      navigate('/messages', { state: { chatId: response.chat._id } });
    } catch (err) {
      setActionError(err.message || 'Failed to start conversation');
    } finally {
      setProcessingAction(false);
    }
  };
  
  const handleDeleteConfirmOpen = () => {
    setDeleteConfirmOpen(true);
  };
  
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
  };
  
  const handleDeleteListing = async () => {
    try {
      setProcessingAction(true);
      dispatch(deleteListingStart());
      
      await deleteListing(id);
      dispatch(deleteListingSuccess(id));
      
      setDeleteConfirmOpen(false);
      navigate('/profile');
    } catch (err) {
      dispatch(deleteListingFailure(err.message || 'Failed to delete listing'));
      setActionError(err.message || 'Failed to delete listing');
    } finally {
      setProcessingAction(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)} 
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }
  
  if (!listing) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 3 }}>
          Listing not found
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)} 
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }
  
  const isFavorite = user?.favorites?.includes(id);
  const isOwner = user?._id === listing.user?._id;
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 2 }}
      >
        Back to Listings
      </Button>
      
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Image gallery */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                position: 'relative',
                height: 400,
                width: '100%',
                bgcolor: 'grey.100',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              {listing.images && listing.images.length > 0 ? (
                <>
                  <Box
                    component="img"
                    src={listing.images[currentImageIndex]}
                    alt={`${listing.brand} ${listing.model}`}
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  
                  {listing.images.length > 1 && (
                    <>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                        }}
                        onClick={handlePrevImage}
                      >
                        <ChevronLeft />
                      </IconButton>
                      
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                        }}
                        onClick={handleNextImage}
                      >
                        <ChevronRight />
                      </IconButton>
                      
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: 1
                        }}
                      >
                        {listing.images.map((_, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: index === currentImageIndex ? 'primary.main' : 'white',
                              cursor: 'pointer'
                            }}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No images available
                  </Typography>
                </Box>
              )}
            </Box>
            
            {listing.images && listing.images.length > 1 && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  mt: 2, 
                  gap: 1, 
                  overflowX: 'auto',
                  pb: 1
                }}
              >
                {listing.images.map((img, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={img}
                    alt={`Thumbnail ${index}`}
                    sx={{
                      height: 60,
                      width: 60,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: index === currentImageIndex ? '2px solid' : 'none',
                      borderColor: 'primary.main'
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </Box>
            )}
          </Grid>
          
          {/* Listing details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {listing.brand} {listing.model}
              </Typography>
              
              <IconButton 
                color="primary" 
                onClick={handleFavoriteToggle}
                disabled={processingAction || !user}
              >
                {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
              </IconButton>
            </Box>
            
            <Typography variant="h5" color="primary" gutterBottom>
              ${listing.price}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={`${listing.side.charAt(0).toUpperCase() + listing.side.slice(1)} side`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={listing.condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} 
                color="secondary" 
                variant="outlined" 
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {typeof listing.location === 'string' 
                  ? listing.location 
                  : listing.location?.address || 'Location not specified'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography variant="body1" paragraph>
              {listing.description || "No description provided."}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={listing.user?.avatar} 
                alt={listing.user?.name}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1">
                  {listing.user?.name || "Unknown seller"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posted {new Date(listing.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            
            {isOwner ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate(`/listings/edit/${id}`)}
                  disabled={processingAction}
                  fullWidth
                >
                  Edit Listing
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={handleDeleteConfirmOpen}
                  disabled={processingAction}
                  fullWidth
                >
                  Delete
                </Button>
              </Box>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Message />}
                onClick={handleContactSeller}
                disabled={processingAction || !user}
                fullWidth
              >
                {processingAction ? <CircularProgress size={24} /> : 'Contact Seller'}
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteConfirmClose}
      >
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this listing? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose} disabled={processingAction}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteListing} 
            color="error" 
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListingDetail;
