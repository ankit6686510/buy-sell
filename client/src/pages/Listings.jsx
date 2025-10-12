import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Fab,
    useMediaQuery,
    useTheme,
    Skeleton,
    alpha, // 👈 Added alpha for theme-aware opacity
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';

import { 
    fetchListingsStart, 
    fetchListingsSuccess, 
    fetchListingsFailure,
} from '../store/slices/listingSlice';
import { fetchListings } from '../services/listingService';
import ModernListingCard from '../components/listings/ModernListingCard';
import ModernFilter from '../components/listings/ModernFilter';
import { gradients } from '../theme'; 

const Listings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isDarkMode = theme.palette.mode === 'dark'; // 👈 Check current mode
    
    // Redux State
    const { listings, loading, error } = useSelector((state) => state.listings);
    const { user } = useSelector((state) => state.auth);
    
    // Local State
    const [filters, setFilters] = useState({});
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    
    // --- Data Fetching Logic ---
    const loadListings = useCallback(async () => {
        try {
            dispatch(fetchListingsStart());
            const data = await fetchListings();
            dispatch(fetchListingsSuccess(data.listings || []));
        } catch (err) {
            dispatch(fetchListingsFailure(err.message || 'Failed to load listings'));
        }
    }, [dispatch]);

    useEffect(() => {
        loadListings();
    }, [loadListings]);
    
    // --- Filtering and Sorting Logic ---
    const filteredListings = useMemo(() => {
        let result = [...listings];
        
        // Apply search (Logic unchanged)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(listing => 
                listing.title?.toLowerCase().includes(query) ||
                listing.brand?.toLowerCase().includes(query) ||
                listing.category?.toLowerCase().includes(query) ||
                listing.description?.toLowerCase().includes(query) ||
                (typeof listing.location === 'string' 
                    ? listing.location.toLowerCase().includes(query)
                    : listing.location?.address?.toLowerCase().includes(query) ||
                      listing.location?.city?.toLowerCase().includes(query))
            );
        }
        
        // Apply category filter (Logic unchanged)
        if (filters.category) {
            result = result.filter(listing => listing.category === filters.category);
        }
        
        // Apply brand filter (Logic unchanged)
        if (filters.brand) {
            result = result.filter(listing => 
                listing.brand?.toLowerCase().includes(filters.brand.toLowerCase())
            );
        }
        
        // Apply condition filter (Logic unchanged)
        if (filters.condition && filters.condition.length > 0) {
            result = result.filter(listing => 
                filters.condition.includes(listing.condition)
            );
        }
        
        // Apply price filter (Logic unchanged)
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            result = result.filter(listing => {
                const price = listing.price;
                const min = filters.minPrice || 0;
                const max = filters.maxPrice || Infinity;
                return price >= min && price <= max;
            });
        }
        
        // Apply sorting (Logic unchanged)
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'price_low':
                    return a.price - b.price;
                case 'price_high':
                    return b.price - a.price;
                case 'featured':
                    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        
        return result;
    }, [listings, filters, searchQuery, sortBy]);
    
    // --- Handlers (Unchanged) ---
    const handleCreateListing = () => {
        if (!user) {
            navigate('/login', { state: { from: '/listings/create' } });
        } else {
            navigate('/listings/create');
        }
    };

    const handleRefresh = () => {
        loadListings();
    };
    
    // --- Render Helpers ---
    const renderLoadingCards = () => {
        return Array.from({ length: 6 }, (_, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                {/* Assuming ModernListingCard supports an isLoading state which will show skeletons */}
                <ModernListingCard isLoading={true} /> 
            </Grid>
        ));
    };

    const renderEmptyState = () => (
        <Box
            sx={{
                textAlign: 'center',
                py: 8,
                px: 3,
                // **DARK MODE FIX**: Use theme colors for background and border
                background: isDarkMode ? alpha(theme.palette.background.paper, 0.7) : alpha(theme.palette.grey[100], 0.9),
                backdropFilter: 'blur(10px)', // Less blur for less heavy effect
                border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.5) : alpha(theme.palette.divider, 0.8)}`,
                borderRadius: '24px',
            }}
        >
            <Typography 
                variant="h4" 
                sx={{ 
                    mb: 2,
                    // Gradient text maintained for branding
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 700,
                }}
            >
                No Products Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                {Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true)) || searchQuery
                    ? "No products match your current filters. Try adjusting your search criteria."
                    : "Be the first to list your product! Start selling in your area today."
                }
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                {(Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true)) || searchQuery) && (
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setFilters({});
                            setSearchQuery('');
                        }}
                        sx={{
                            borderRadius: '16px',
                            // **DARK MODE FIX**: Use theme colors for outline button
                            borderColor: isDarkMode ? alpha(theme.palette.primary.light, 0.5) : alpha(theme.palette.primary.main, 0.5),
                            color: theme.palette.primary.main, 
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                background: alpha(theme.palette.primary.main, 0.1),
                            },
                        }}
                    >
                        Clear Filters
                    </Button>
                )}
                
                <Button
                    variant="contained"
                    onClick={handleCreateListing}
                    startIcon={<Add />}
                    sx={{
                        borderRadius: '16px',
                        // Gradient button style maintained
                        background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
                        },
                    }}
                >
                    Create First Listing
                </Button>
            </Box>
        </Box>
    );

    // --- Main Component Render ---
    return (
        <Box
            sx={{
                minHeight: '100vh',
                // **DARK MODE FIX**: Use theme colors for background, fading between background and paper/default dark colors
                background: isDarkMode 
                    ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.paper} 100%)`, 
                color: theme.palette.text.primary,
                py: 4,
            }}
        >
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography 
                            variant="h3" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 800,
                                // Gradient text maintained
                                background: gradients.primary,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                mb: 1,
                            }}
                        >
                            Browse Products
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                            Discover amazing deals from sellers in your area
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={handleRefresh}
                            startIcon={<Refresh />}
                            sx={{
                                borderRadius: '16px',
                                // **DARK MODE FIX**: Use theme colors for outline button
                                borderColor: isDarkMode ? alpha(theme.palette.primary.light, 0.5) : alpha(theme.palette.primary.main, 0.5),
                                color: theme.palette.primary.main,
                                display: { xs: 'none', sm: 'flex' },
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    background: alpha(theme.palette.primary.main, 0.1),
                                },
                            }}
                        >
                            Refresh
                        </Button>
                        
                        <Button
                            variant="contained"
                            onClick={handleCreateListing}
                            startIcon={<Add />}
                            sx={{
                                borderRadius: '16px',
                                // Gradient button style maintained
                                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                                px: 3,
                                py: 1.5,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 12px 35px rgba(99, 102, 241, 0.4)',
                                },
                            }}
                        >
                            Sell Your Product
                        </Button>
                    </Box>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 4, 
                            borderRadius: '16px',
                            // **DARK MODE FIX**: Adjusted alert background for dark theme using theme palette
                            background: isDarkMode ? alpha(theme.palette.error.dark, 0.15) : alpha(theme.palette.error.light, 0.5),
                            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                            color: isDarkMode ? theme.palette.error.light : theme.palette.error.dark,
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Filters */}
                {/* NOTE: ModernFilter component would need its internal styles updated for dark theme */}
                <ModernFilter
                    filters={filters}
                    onFiltersChange={setFilters}
                    onSearch={setSearchQuery}
                    onSort={setSortBy}
                    onViewChange={setViewMode}
                    viewMode={viewMode}
                    resultsCount={filteredListings.length}
                    isLoading={loading}
                />

                {/* Listings Grid */}
                {loading ? (
                    <Grid container spacing={3}>{renderLoadingCards()}</Grid>
                ) : filteredListings.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <Grid 
                        container 
                        spacing={3} 
                        sx={{
                            '& .MuiGrid-item': {
                                display: 'flex',
                            }
                        }}
                    >
                        {filteredListings.map((listing) => (
                            <Grid 
                                item 
                                key={listing._id} 
                                xs={12} 
                                sm={6} 
                                md={viewMode === 'grid' ? 4 : 12} 
                                lg={viewMode === 'grid' ? 3 : 12}
                            >
                                {/* NOTE: ModernListingCard component would need internal styles updated for dark theme */}
                                <ModernListingCard listing={listing} />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Mobile FAB */}
                {isMobile && (
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={handleCreateListing}
                        sx={{ 
                            position: 'fixed', 
                            bottom: 24, 
                            right: 24,
                            // Gradient FAB maintained
                            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
                            },
                        }}
                    >
                        <Add />
                    </Fab>
                )}
            </Container>
        </Box>
    );
};

export default Listings;