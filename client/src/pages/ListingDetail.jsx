import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container, Grid, Typography, Box, Button, Paper, Chip, Divider, Avatar, CircularProgress, Alert, Dialog,
    DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, useTheme, alpha
} from '@mui/material';
import {
    FavoriteBorder, Favorite, LocationOn, ArrowBack, Message, ChevronLeft, ChevronRight
} from '@mui/icons-material';

import { 
    getListingById, addFavorite, removeFavorite, deleteListing 
} from '../services/listingService';
import { startChat } from '../services/messageService';
import { 
    fetchListingStart, fetchListingSuccess, fetchListingFailure,
    toggleFavoriteSuccess, deleteListingStart, deleteListingSuccess, deleteListingFailure
} from '../store/slices/listingSlice';
import { addChatSuccess } from '../store/slices/messageSlice';

const ListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme(); // 👈 Initialize useTheme
    const isDarkMode = theme.palette.mode === 'dark'; // 👈 Check current mode

    // Redux State Selection
    const { listing, loading, error: listingError } = useSelector((state) => state.listings);
    const { user } = useSelector((state) => state.auth);

    // Local Component State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [processingAction, setProcessingAction] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const isFavorite = user?.favorites?.includes(id);
    const isOwner = user?._id === listing?.user?._id;
    const imageCount = listing?.images?.length || 0;

    // --- Data Fetching Effect ---
    useEffect(() => {
        const fetchListing = async () => {
            dispatch(fetchListingStart());
            try {
                const data = await getListingById(id);
                dispatch(fetchListingSuccess(data.listing));
            } catch (err) {
                dispatch(fetchListingFailure(err.message || 'Failed to load listing'));
            }
        };
        fetchListing();
    }, [id, dispatch]);

    // --- Image Gallery Handlers ---
    const handlePrevImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === 0 ? imageCount - 1 : prevIndex - 1
        );
    }, [imageCount]);

    const handleNextImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === imageCount - 1 ? 0 : prevIndex + 1
        );
    }, [imageCount]);

    // --- User Action Handlers ---
    const handleFavoriteToggle = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/listings/${id}` } });
            return;
        }
        
        setProcessingAction(true);
        setActionError(null);

        try {
            const serviceCall = isFavorite ? removeFavorite : addFavorite;
            await serviceCall(id);
            
            dispatch(toggleFavoriteSuccess({ listingId: id, isFavorite: !isFavorite }));
            const message = isFavorite ? 'Removed from favorites' : 'Added to favorites';
            setSuccessMessage(message);
            
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
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
        
        if (isOwner) {
            setActionError("You can't message yourself.");
            setTimeout(() => setActionError(null), 3000);
            return;
        }
        
        if (!listing.user?._id) {
             setActionError("Seller information is missing.");
            setTimeout(() => setActionError(null), 3000);
            return;
        }
        
        setProcessingAction(true);
        setActionError(null);

        try {
            const initialMessage = `Hi, I'm interested in your ${listing.title}.`;
            // Assumes listing.user._id is the recipient ID
            const response = await startChat(listing.user._id, id, initialMessage);
            
            dispatch(addChatSuccess(response.chat));
            navigate('/messages', { state: { chatId: response.chat._id } });
        } catch (err) {
            setActionError(err.message || 'Failed to start conversation');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleDeleteListing = async () => {
        setProcessingAction(true);
        setDeleteConfirmOpen(false); // Close dialog immediately for better UX
        dispatch(deleteListingStart());
        
        try {
            await deleteListing(id);
            dispatch(deleteListingSuccess(id));
            navigate('/profile');
        } catch (err) {
            dispatch(deleteListingFailure(err.message || 'Failed to delete listing'));
            setActionError(err.message || 'Failed to delete listing');
        } finally {
            setProcessingAction(false);
        }
    };

    // --- Conditional Render Blocks ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (listingError || !listing) {
        const message = listingError || 'Listing not found';
        return (
            <Container>
                <Alert severity={listingError ? "error" : "info"} sx={{ mt: 3 }}>
                    {message}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Container>
        );
    }

    // --- Theme-Aware Style Constants ---
    const navButtonBg = isDarkMode ? alpha(theme.palette.background.paper, 0.9) : alpha(theme.palette.common.white, 0.8);
    const navButtonHoverBg = isDarkMode ? theme.palette.background.paper : theme.palette.common.white;
    const thumbnailBorderColor = isDarkMode ? theme.palette.grey[600] : theme.palette.grey[300];
    const imageContainerBg = isDarkMode ? theme.palette.grey[900] : theme.palette.grey[100];


    // --- Main Render ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Back to Listings
            </Button>
            
            {/* Action Feedback */}
            {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                <Grid container spacing={4}>
                    
                    {/* 1. Image Gallery */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ position: 'relative', height: 400, bgcolor: imageContainerBg, borderRadius: 1, overflow: 'hidden' }}>
                            {imageCount > 0 ? (
                                <>
                                    <Box
                                        component="img"
                                        src={listing.images[currentImageIndex]}
                                        alt={listing.title}
                                        sx={{ height: '100%', width: '100%', objectFit: 'contain' }}
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                    <Box sx={{ height: '100%', display: 'none', alignItems: 'center', justifyContent: 'center', backgroundColor: imageContainerBg }}>
                                        <Typography variant="body2" color="text.secondary">Image not available</Typography>
                                    </Box>
                                    
                                    {imageCount > 1 && (
                                        <>
                                            {/* Nav Buttons (Theme-aware styles) */}
                                            <IconButton 
                                                onClick={handlePrevImage} 
                                                sx={{ 
                                                    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', 
                                                    bgcolor: navButtonBg, 
                                                    '&:hover': { bgcolor: navButtonHoverBg },
                                                    color: isDarkMode ? 'white' : 'black' // Ensure icon visibility
                                                }}
                                            >
                                                <ChevronLeft />
                                            </IconButton>
                                            <IconButton 
                                                onClick={handleNextImage} 
                                                sx={{ 
                                                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', 
                                                    bgcolor: navButtonBg, 
                                                    '&:hover': { bgcolor: navButtonHoverBg },
                                                    color: isDarkMode ? 'white' : 'black' // Ensure icon visibility
                                                }}
                                            >
                                                <ChevronRight />
                                            </IconButton>
                                            
                                            {/* Image Dots */}
                                            <Box sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
                                                {listing.images.map((_, index) => (
                                                    <Box
                                                        key={index}
                                                        onClick={() => setCurrentImageIndex(index)}
                                                        sx={{ 
                                                            width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
                                                            // 👈 DARK MODE FIX: Toggle colors for dots
                                                            bgcolor: index === currentImageIndex ? 'primary.main' : isDarkMode ? alpha('white', 0.6) : 'white', 
                                                            border: index !== currentImageIndex && '1px solid',
                                                            borderColor: index !== currentImageIndex && 'primary.main'
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                </>
                            ) : (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">No images available</Typography>
                                </Box>
                            )}
                        </Box>
                        
                        {/* Image Thumbnails (Theme-aware border) */}
                        {imageCount > 1 && (
                            <Box sx={{ display: 'flex', mt: 2, gap: 1, overflowX: 'auto', pb: 1 }}>
                                {listing.images.map((img, index) => (
                                    <Box
                                        key={index}
                                        component="img"
                                        src={img}
                                        alt={`Thumbnail ${index}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                        sx={{
                                            height: 60, width: 60, objectFit: 'cover', borderRadius: 1, cursor: 'pointer',
                                            border: index === currentImageIndex ? '2px solid' : '1px solid',
                                            // 👈 DARK MODE FIX: Dynamic border color for inactive thumbnails
                                            borderColor: index === currentImageIndex ? 'primary.main' : thumbnailBorderColor
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Grid>
                    
                    {/* 2. Listing Details and Actions */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h4" component="h1" sx={{pr: 2}}>{listing.title}</Typography>
                            <IconButton color="primary" onClick={handleFavoriteToggle} disabled={processingAction || !user}>
                                {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                            </IconButton>
                        </Box>
                        
                        <Typography variant="h5" color="primary" gutterBottom sx={{ mt: 1, fontWeight: 700 }}>
                            ₹{listing.price?.toLocaleString('en-IN')}
                            {listing.originalPrice > listing.price && (
                                <Typography component="span" variant="body2" sx={{ ml: 2, textDecoration: 'line-through', color: 'text.secondary' }}>
                                    ₹{listing.originalPrice?.toLocaleString('en-IN')}
                                </Typography>
                            )}
                        </Typography>
                        
                        {/* Chips/Tags */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            {listing.category && <Chip label={listing.category.toUpperCase()} color="primary" variant="outlined" size="small" />}
                            {listing.subcategory && <Chip label={listing.subcategory.toUpperCase()} color="secondary" variant="outlined" size="small" />}
                            {listing.condition && <Chip label={listing.condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} color="info" variant="outlined" size="small" />}
                            {listing.brand && <Chip label={listing.brand} variant="outlined" size="small" />}
                        </Box>
                        
                        {/* Location */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationOn color="action" sx={{ mr: 1 }} />
                            <Typography variant="body1">
                                {typeof listing.location === 'string' ? listing.location : listing.location?.address || 'Location not specified'}
                            </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Description */}
                        <Typography variant="h6" gutterBottom>Description</Typography>
                        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>{listing.description || "No description provided."}</Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Seller Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar 
                                src={listing.user?.avatar} 
                                alt={listing.user?.name} 
                                sx={{ mr: 2, bgcolor: isDarkMode ? theme.palette.primary.dark : theme.palette.primary.light }} 
                            />
                            <Box>
                                <Typography variant="subtitle1" fontWeight={600}>{listing.user?.name || "Unknown seller"}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Posted {new Date(listing.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Action Buttons (Owner vs Buyer) */}
                        {isOwner ? (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="contained" color="primary" onClick={() => navigate(`/listings/edit/${id}`)} disabled={processingAction} fullWidth>
                                    Edit Listing
                                </Button>
                                <Button variant="outlined" color="error" onClick={() => setDeleteConfirmOpen(true)} disabled={processingAction} fullWidth>
                                    Delete
                                </Button>
                            </Box>
                        ) : (
                            <Button 
                                variant="contained" 
                                color="primary"
                                startIcon={processingAction ? null : <Message />}
                                onClick={handleContactSeller}
                                disabled={processingAction || !user}
                                fullWidth
                                sx={{ height: 48 }}
                            >
                                {processingAction ? <CircularProgress size={24} color="inherit" /> : 'Contact Seller'}
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>
            
            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={deleteConfirmOpen} 
                onClose={() => setDeleteConfirmOpen(false)}
                // Use PaperProps to ensure the dialog itself respects the theme
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper'
                    }
                }}
            >
                <DialogTitle>Delete Listing</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this listing? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} disabled={processingAction}>Cancel</Button>
                    <Button onClick={handleDeleteListing} color="error" disabled={processingAction}>
                        {processingAction ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ListingDetail;