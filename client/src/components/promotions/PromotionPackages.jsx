import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  FormControl,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  TrendingUp,
  Star,
  FlashOn,
  EmojiEvents,
  Check,
  Close,
} from '@mui/icons-material';

// Promotion packages configuration
export const PROMOTION_PACKAGES = {
  spotlight: {
    id: 'spotlight',
    name: 'Spotlight',
    icon: Visibility,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    tagline: 'Get 3x more views',
    description: 'Your ad appears in the spotlight section for maximum visibility',
    pricing: {
      '3_days': { price: 49, duration: 3, popular: false },
      '7_days': { price: 99, duration: 7, popular: true },
      '15_days': { price: 179, duration: 15, popular: false },
    },
    features: [
      '3x more views guaranteed',
      'Appears in spotlight section',
      'Priority in search results',
      'Special highlight badge',
    ],
    boost: 50,
  },
  top_ads: {
    id: 'top_ads',
    name: 'Top Ads',
    icon: TrendingUp,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    tagline: 'Always appear first',
    description: 'Your ad stays at the top of search results',
    pricing: {
      '3_days': { price: 79, duration: 3, popular: false },
      '7_days': { price: 149, duration: 7, popular: true },
      '15_days': { price: 279, duration: 15, popular: false },
    },
    features: [
      'Top position in search results',
      'Up to 5x more visibility',
      'Premium ad placement',
      'Enhanced listing card',
    ],
    boost: 75,
  },
  urgent: {
    id: 'urgent',
    name: 'Urgent',
    icon: FlashOn,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    tagline: 'Sell faster',
    description: 'Mark your ad as urgent for quick sales',
    pricing: {
      '3_days': { price: 29, duration: 3, popular: false },
      '7_days': { price: 49, duration: 7, popular: true },
      '15_days': { price: 89, duration: 15, popular: false },
    },
    features: [
      'Urgent tag on your listing',
      'Creates urgency for buyers',
      'Higher response rate',
      'Quick sale optimization',
    ],
    boost: 30,
  },
  featured_plus: {
    id: 'featured_plus',
    name: 'Featured Plus',
    icon: EmojiEvents,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    tagline: 'Premium everything',
    description: 'Complete premium package with all benefits',
    pricing: {
      '7_days': { price: 199, duration: 7, popular: false },
      '15_days': { price: 349, duration: 15, popular: true },
      '30_days': { price: 599, duration: 30, popular: false },
    },
    features: [
      'All premium features included',
      'Maximum visibility boost',
      'Priority customer support',
      'Detailed analytics dashboard',
      'Social media promotion',
    ],
    boost: 100,
  },
};

// Individual package card component
const PromotionPackageCard = ({ package: pkg, selectedDuration, onSelect, onPromote }) => {
  const IconComponent = pkg.icon;
  const popularDuration = Object.entries(pkg.pricing).find(([_, data]) => data.popular)?.[0] || '7_days';
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: selectedDuration ? '2px solid' : '1px solid',
        borderColor: selectedDuration ? pkg.color : 'rgba(0,0,0,0.12)',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${pkg.color}40`,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: pkg.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <IconComponent sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {pkg.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pkg.tagline}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {pkg.description}
        </Typography>

        {/* Features */}
        <List dense sx={{ mb: 3 }}>
          {pkg.features.map((feature, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Check sx={{ fontSize: 16, color: pkg.color }} />
              </ListItemIcon>
              <ListItemText 
                primary={feature}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>

        {/* Pricing */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Choose duration:
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedDuration || popularDuration}
              onChange={(e) => onSelect(pkg.id, e.target.value)}
            >
              {Object.entries(pkg.pricing).map(([duration, data]) => (
                <FormControlLabel
                  key={duration}
                  value={duration}
                  control={<Radio size="small" sx={{ color: pkg.color }} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {data.duration} days - ₹{data.price}
                      </Typography>
                      {data.popular && (
                        <Chip 
                          label="Popular" 
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            background: pkg.gradient,
                            color: 'white',
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      </CardContent>

      {/* Action Button */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onPromote(pkg, selectedDuration || popularDuration)}
          sx={{
            background: pkg.gradient,
            borderRadius: '12px',
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              background: pkg.gradient,
              opacity: 0.9,
            },
          }}
        >
          Promote Now
        </Button>
      </Box>
    </Card>
  );
};

// Main promotion packages component
const PromotionPackages = ({ 
  listingId, 
  isOpen, 
  onClose, 
  onPromote,
  currentPromotion = null 
}) => {
  const [selectedPackages, setSelectedPackages] = useState({});

  const handlePackageSelect = (packageId, duration) => {
    setSelectedPackages(prev => ({
      ...prev,
      [packageId]: duration
    }));
  };

  const handlePromoteClick = (pkg, duration) => {
    const pricing = pkg.pricing[duration];
    const promotionData = {
      listingId,
      packageId: pkg.id,
      duration: pricing.duration,
      price: pricing.price,
      boost: pkg.boost,
    };
    
    onPromote(promotionData);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Promote Your Listing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Boost your listing's visibility and get more buyers
            </Typography>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {currentPromotion && currentPromotion.type !== 'none' && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'success.light', borderRadius: '12px' }}>
            <Typography variant="body2" color="success.dark">
              Your listing is currently promoted with {PROMOTION_PACKAGES[currentPromotion.type]?.name} 
              until {new Date(currentPromotion.endDate).toLocaleDateString()}
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {Object.values(PROMOTION_PACKAGES).map((pkg) => (
            <Grid item xs={12} md={6} key={pkg.id}>
              <PromotionPackageCard
                package={pkg}
                selectedDuration={selectedPackages[pkg.id]}
                onSelect={handlePackageSelect}
                onPromote={handlePromoteClick}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: '12px' }}>
          <Typography variant="body2" color="info.dark">
            💡 <strong>Pro Tip:</strong> Promoted listings get 3-10x more views and sell 2x faster than regular listings.
            Choose longer durations for better value!
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionPackages;
