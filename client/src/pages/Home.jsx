import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  CircularProgress,
  Avatar,
  Rating,
  Chip,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  TrendingUp,
  Security,
  Speed,
  CheckCircle,
  Star,
  People,
  SwapHoriz,
  Message,
  ArrowForward,
  PlayArrow
} from '@mui/icons-material';

import ListingCard from '../components/listings/ListingCard';
import ListingFilter from '../components/listings/ListingFilter';
import GlassCard from '../components/modern/GlassCard';
import GradientButton from '../components/modern/GradientButton';

import { 
  fetchListingsStart, 
  fetchListingsSuccess, 
  fetchListingsFailure 
} from '../store/slices/listingSlice';
import { getListings } from '../services/listingService';
import { gradients, animations } from '../theme';

// Mock testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c7a3?w=150&h=150&fit=crop&crop=face",
    role: "Verified Seller",
    rating: 5,
    comment: "Sold my iPhone in just 3 days! The platform made it so easy to connect with serious buyers.",
    location: "San Francisco, CA",
    verified: true
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "Power User",
    rating: 5,
    comment: "Found amazing deals on furniture and electronics. The verification system gives me confidence in every purchase.",
    location: "Austin, TX",
    verified: true
  },
  {
    id: 3,
    name: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    role: "Happy Customer",
    rating: 5,
    comment: "Love the clean interface and secure messaging. Made buying and selling so much easier than other platforms.",
    location: "New York, NY",
    verified: true
  }
];

// Mock statistics
const stats = [
  { label: "Items Sold", value: "25,000+", icon: SwapHoriz },
  { label: "Active Users", value: "12,000+", icon: People },
  { label: "Average Sale Time", value: "3.5 days", icon: Speed },
  { label: "User Satisfaction", value: "96%", icon: TrendingUp }
];

// Feature highlights
const features = [
  {
    icon: Security,
    title: "Verified & Secure",
    description: "Multi-level verification system ensures safe and trusted transactions between buyers and sellers.",
    color: "#22c55e"
  },
  {
    icon: Speed,
    title: "Smart Search",
    description: "Advanced search and filtering helps you find exactly what you're looking for in your area.",
    color: "#6366f1"
  },
  {
    icon: Message,
    title: "Real-time Chat",
    description: "Secure messaging system with read receipts and instant notifications for seamless communication.",
    color: "#ec4899"
  },
  {
    icon: TrendingUp,
    title: "Trust Score",
    description: "Dynamic trust scoring system based on verifications and community feedback.",
    color: "#f59e0b"
  }
];

const Home = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { filteredListings, loading, error } = useSelector((state) => state.listings);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [visibleListings, setVisibleListings] = useState(6);

  useEffect(() => {
    const loadListings = async () => {
      try {
        dispatch(fetchListingsStart());
        const listings = await getListings({ status: 'available' });
        dispatch(fetchListingsSuccess(listings));
      } catch (err) {
        dispatch(fetchListingsFailure(err.message));
      }
    };

    loadListings();
  }, [dispatch]);

  const loadMoreListings = () => {
    setVisibleListings(prev => prev + 6);
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ 
          mt: { xs: 2, md: 4 }, 
          mb: { xs: 4, md: 8 },
          position: 'relative',
          minHeight: { xs: 'auto', md: '80vh' },
          display: 'flex',
          alignItems: 'center'
        }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                animation: animations.slideInUp,
                animationDelay: '0.1s',
                animationFillMode: 'both'
              }}>
                <Chip 
                  label="🎉 New: Real-time matching algorithm" 
                  sx={{ 
                    mb: 3,
                    background: gradients.primary,
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 2, py: 0.5 }
                  }} 
                />
                
                <Typography 
                  variant="h1" 
                  component="h1" 
                  sx={{ 
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Buy & Sell
                  <br />
                  <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                    Anything, Anywhere
                  </Box>
                </Typography>
                
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 4, 
                    maxWidth: 500,
                    lineHeight: 1.6,
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}
                >
                  Join thousands of users buying and selling pre-loved items. 
                  From electronics to fashion, find great deals in your area.
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  <GradientButton
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    to={isAuthenticated ? "/create-listing" : "/register"}
                    endIcon={<ArrowForward />}
                    sx={{ 
                      px: 4, 
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700
                    }}
                  >
                    {isAuthenticated ? "Create Listing" : "Get Started Free"}
                  </GradientButton>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{ 
                      px: 4, 
                      py: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 }
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>
                
                {/* Trust indicators */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      94% Success Rate
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Verified Users Only
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      4.9/5 Rating
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  animation: animations.float,
                  display: 'flex',
                  justifyContent: 'center',
                  mt: { xs: 4, md: 0 }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <GlassCard 
                    sx={{ 
                      p: 3,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 4,
                      maxWidth: 400,
                      width: '100%'
                    }}
                  >
                    {/* Marketplace Illustration */}
                    <Box sx={{
                      width: '100%',
                      height: 300,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Marketplace Icons */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, p: 3 }}>
                        <Box sx={{ textAlign: 'center', opacity: 0.7 }}>
                          <Box sx={{ 
                            width: 60, height: 60, 
                            bgcolor: 'primary.main', 
                            borderRadius: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 1
                          }}>
                            <Typography variant="h6" color="white">📱</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Electronics</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', opacity: 0.8 }}>
                          <Box sx={{ 
                            width: 60, height: 60, 
                            bgcolor: 'secondary.main', 
                            borderRadius: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 1
                          }}>
                            <Typography variant="h6" color="white">👕</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Fashion</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', opacity: 0.7 }}>
                          <Box sx={{ 
                            width: 60, height: 60, 
                            bgcolor: 'success.main', 
                            borderRadius: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 1
                          }}>
                            <Typography variant="h6" color="white">🏠</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Home</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', opacity: 0.6 }}>
                          <Box sx={{ 
                            width: 60, height: 60, 
                            bgcolor: 'warning.main', 
                            borderRadius: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 1
                          }}>
                            <Typography variant="h6" color="white">⚽</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Sports</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', opacity: 0.9 }}>
                          <Box sx={{ 
                            width: 60, height: 60, 
                            bgcolor: 'error.main', 
                            borderRadius: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 1
                          }}>
                            <Typography variant="h6" color="white">🚗</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Vehicles</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', opacity: 0.6 }}>
                          <Box sx={{ 
                            width: 60, height: 60, 
                            bgcolor: 'info.main', 
                            borderRadius: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 1
                          }}>
                            <Typography variant="h6" color="white">📚</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Books</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </GlassCard>
                  
                  {/* Floating stats */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: -20, 
                    right: -20,
                    display: { xs: 'none', md: 'block' }
                  }}>
                    <GlassCard sx={{ p: 2 }}>
                      <Typography variant="h6" color="primary">25K+</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Items Sold
                      </Typography>
                    </GlassCard>
                  </Box>
                  
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: -20, 
                    left: -20,
                    display: { xs: 'none', md: 'block' }
                  }}>
                    <GlassCard sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          bgcolor: 'success.main', 
                          borderRadius: '50%',
                          animation: animations.pulse
                        }} />
                        <Typography variant="caption" color="text.secondary">
                          Live Marketplace
                        </Typography>
                      </Box>
                    </GlassCard>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Statistics Section */}
      <Box sx={{ 
        py: { xs: 4, md: 6 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <GlassCard sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  animation: animations.slideInUp,
                  animationDelay: `${0.1 * (index + 1)}s`,
                  animationFillMode: 'both'
                }}>
                  <stat.icon sx={{ 
                    fontSize: 40, 
                    color: 'primary.main', 
                    mb: 2 
                  }} />
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Why Choose SecondMarket?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Advanced technology meets user-friendly design to create the perfect buying and selling experience
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <GlassCard sx={{ 
                  p: 4, 
                  height: '100%',
                  textAlign: 'center',
                  animation: animations.slideInUp,
                  animationDelay: `${0.1 * (index + 1)}s`,
                  animationFillMode: 'both'
                }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}40 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}>
                    <feature.icon sx={{ fontSize: 36, color: feature.color }} />
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Customer Testimonials */}
      <Box sx={{ 
        py: { xs: 6, md: 10 },
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}10 100%)`
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              What Our Users Say
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Join thousands of satisfied users who've successfully bought and sold items through our platform
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <GlassCard sx={{ 
                  p: 4, 
                  height: '100%',
                  animation: animations.slideInUp,
                  animationDelay: `${0.1 * (index + 1)}s`,
                  animationFillMode: 'both'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar 
                      src={testimonial.avatar} 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        mr: 2,
                        border: '3px solid',
                        borderColor: 'primary.main'
                      }} 
                    />
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        {testimonial.verified && (
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role} • {testimonial.location}
                      </Typography>
                      <Rating value={testimonial.rating} size="small" readOnly sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ 
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    color: 'text.primary'
                  }}>
                    "{testimonial.comment}"
                  </Typography>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Available Listings */}
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Latest Products
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              Browse through our curated collection of available products from trusted sellers in your area
            </Typography>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <ListingFilter />
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <GlassCard sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="error" variant="h6" gutterBottom>
                Error loading listings
              </Typography>
              <Typography color="text.secondary">
                {error}
              </Typography>
            </GlassCard>
          ) : filteredListings.length === 0 ? (
            <GlassCard sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No listings found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your filters or be the first to create a listing!
              </Typography>
              <GradientButton
                variant="contained"
                component={RouterLink}
                to="/create-listing"
                size="large"
              >
                Create First Listing
              </GradientButton>
            </GlassCard>
          ) : (
            <>
              <Grid container spacing={3}>
                {filteredListings.slice(0, visibleListings).map((listing) => (
                  <Grid item xs={12} sm={6} lg={4} key={listing._id}>
                    <ListingCard listing={listing} />
                  </Grid>
                ))}
              </Grid>
              
              {visibleListings < filteredListings.length && (
                <Box sx={{ textAlign: 'center', mt: 6 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={loadMoreListings}
                    sx={{ px: 4, py: 2 }}
                  >
                    Load More Listings
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 },
        background: gradients.primary,
        color: 'white',
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h2" gutterBottom sx={{ color: 'white' }}>
            Ready to Start Trading?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 500, mx: 'auto' }}>
            Join our marketplace today and start buying and selling in just a few clicks
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/listings"
              sx={{ 
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 2,
                fontSize: '1rem',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Browse Listings
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
