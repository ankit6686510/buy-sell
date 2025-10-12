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
  useTheme, // <-- Added for theme access
  alpha,    // <-- Added for color manipulation
} from '@mui/material';
import {
  Visibility,
  TrendingUp,
  FlashOn,
  EmojiEvents,
  Check,
  Close,
} from '@mui/icons-material';

// --- Promotion packages configuration (Using theme-ready colors) ---
// Note: We keep gradient/color hexes here but use alpha/theme for shadows/borders.
export const PROMOTION_PACKAGES = {
  spotlight: {
    id: 'spotlight',
    name: 'Spotlight',
    icon: Visibility,
    color: '#f59e0b', // Yellow/Warning
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
    color: '#3b82f6', // Blue/Info
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
    color: '#ef4444', // Red/Error
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
    color: '#8b5cf6', // Purple/Secondary
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

// --- Individual package card component ---
const PromotionPackageCard = ({ package: pkg, selectedDuration, onSelect, onPromote }) => {
  const theme = useTheme();
  const IconComponent = pkg.icon;
  const popularDuration = Object.entries(pkg.pricing).find(([_, data]) => data.popular)?.[0] || '7_days';
  
  // Determine if the current card is selected
  const isSelected = selectedDuration === pkg.id;

  return (
    <Card
      elevation={isSelected ? 6 : 2} // Increased elevation when selected
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        // Theme-aware border for selection state
        border: isSelected ? `3px solid ${pkg.color}` : `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, // Ensure it respects dark mode paper color
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)', // Deeper lift on hover
          // Theme-aware, color-tinted shadow on hover
          boxShadow: isSelected 
            ? theme.shadows[10] 
            : `0 12px 30px ${alpha(pkg.color, theme.palette.mode === 'dark' ? 0.3 : 0.5)}`,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 52, // Slightly larger icon container
              height: 52,
              borderRadius: '16px',
              background: pkg.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            <IconComponent sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: pkg.color }}>
              {pkg.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
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
                {/* Use the primary color for the checkmark */}
                <Check sx={{ fontSize: 18, color: pkg.color }} /> 
              </ListItemIcon>
              <ListItemText 
                primary={feature}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
              />
            </ListItem>
          ))}
        </List>

        {/* Pricing */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Choose duration:
          </Typography>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              // Use the package ID as the RadioGroup value to manage selection state
              value={selectedDuration || popularDuration}
              onChange={(e) => onSelect(pkg.id, e.target.value)}
            >
              {Object.entries(pkg.pricing).map(([duration, data]) => (
                <FormControlLabel
                  key={duration}
                  value={duration}
                  control={
                    // Theme-aware radio button color
                    <Radio 
                      size="small" 
                      sx={{ 
                        color: pkg.color,
                        '&.Mui-checked': { color: pkg.color },
                      }} 
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {data.duration} days - <strong style={{ color: pkg.color }}>₹{data.price}</strong>
                      </Typography>
                      {data.popular && (
                        <Chip 
                          label="POPULAR" 
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            background: pkg.gradient,
                            color: 'white',
                            // Add a subtle shadow to the popular chip
                            boxShadow: `0 1px 4px ${alpha(pkg.color, 0.5)}`,
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
            fontWeight: 700,
            color: 'white',
            boxShadow: `0 4px 15px ${alpha(pkg.color, 0.6)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: pkg.gradient, // Keep gradient on hover
              opacity: 0.95,
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 20px ${alpha(pkg.color, 0.8)}`,
            },
          }}
        >
          Activate {pkg.name}
        </Button>
      </Box>
    </Card>
  );
};

// --- Main promotion packages component ---
const PromotionPackages = ({ 
  listingId, 
  isOpen, 
  onClose, 
  onPromote,
  currentPromotion = null 
}) => {
  const [selectedPackages, setSelectedPackages] = useState({});
  const theme = useTheme();

  const handlePackageSelect = (packageId, duration) => {
    setSelectedPackages(prev => ({
      // Only one package can be selected at a time, so overwrite all previous
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
          // Subtle backdrop blur for premium feel
          backdropFilter: 'blur(8px)',
          background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.95 : 0.98),
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[15],
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Level Up Your Listing ✨
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select the perfect boost to maximize your sales potential.
            </Typography>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1, color: 'text.secondary' }}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
        {/* Current Promotion Alert (Enhanced) */}
        {currentPromotion && currentPromotion.type !== 'none' && (
          <Box 
            sx={{ 
              mb: 3, 
              p: 2, 
              backgroundColor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.1 : 0.2), 
              borderRadius: '12px',
              borderLeft: `5px solid ${theme.palette.success.main}`,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.success.dark }}>
              ✅ Your listing is **currently promoted** with **{PROMOTION_PACKAGES[currentPromotion.type]?.name}** until **{new Date(currentPromotion.endDate).toLocaleDateString()}**.
            </Typography>
          </Box>
        )}

        <Grid container spacing={4}>
          {Object.values(PROMOTION_PACKAGES).map((pkg) => (
            <Grid item xs={12} md={6} key={pkg.id}>
              <PromotionPackageCard
                package={pkg}
                // Pass the duration value, not just the boolean
                selectedDuration={selectedPackages[pkg.id]} 
                onSelect={handlePackageSelect}
                onPromote={handlePromoteClick}
              />
            </Grid>
          ))}
        </Grid>

        {/* Pro Tip (Enhanced) */}
        <Box sx={{ 
          mt: 4, 
          p: 2.5, 
          backgroundColor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.08 : 0.15), 
          borderRadius: '12px', 
          border: `1px dashed ${alpha(theme.palette.info.main, 0.5)}` 
        }}>
          <Typography variant="body2" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
            🚀 Pro Tip:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Promoted listings get **3-10x more views** and **sell 2x faster** than regular listings. 
            The longer duration packages offer the best value!
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionPackages;