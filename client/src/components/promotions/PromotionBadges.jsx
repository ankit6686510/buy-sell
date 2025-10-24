import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography,
  keyframes,
  useTheme, // <-- Added useTheme
  alpha,    // <-- Added alpha for opacity control
} from '@mui/material';
import {
  Visibility,
  TrendingUp,
  FlashOn,
  EmojiEvents,
  Star,
  AutoAwesome,
} from '@mui/icons-material';

// --- Animations ---
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.85; }
  100% { transform: scale(1); opacity: 1; }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// --- Promotion Configs (Using Theme-Based Colors for Consistency) ---
// Note: Gradients still use hex for precise control, but base color is now derived from theme for other styling.
const getPromotionConfigs = (theme) => ({
  spotlight: {
    icon: Visibility,
    label: 'Spotlight',
    color: theme.palette.warning.main, // Primary color for Yellow/Gold
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    description: 'Featured in spotlight section',
    animation: shimmerAnimation,
  },
  top_ads: {
    icon: TrendingUp,
    label: 'Top Ad',
    color: theme.palette.info.main, // Primary color for Blue
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    description: 'Premium placement at top',
    animation: null,
  },
  urgent: {
    icon: FlashOn,
    label: 'Urgent',
    color: theme.palette.error.main, // Primary color for Red
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    description: 'Quick sale needed',
    animation: pulseAnimation,
  },
  featured_plus: {
    icon: EmojiEvents,
    label: 'Featured+',
    color: theme.palette.secondary.main, // Using secondary for Purple
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    description: 'Premium featured listing',
    animation: null,
  },
});

// --- Individual Promotion Badge Component ---
export const PromotionBadge = ({ 
  type, 
  size = 'medium', 
  variant = 'chip',
  showIcon = true,
  showLabel = true 
}) => {
  const theme = useTheme();
  const PROMOTION_CONFIGS = getPromotionConfigs(theme);

  if (!type || type === 'none' || !PROMOTION_CONFIGS[type]) return null;

  const config = PROMOTION_CONFIGS[type];
  const IconComponent = config.icon;

  const sizeProps = {
    small: { height: 20, fontSize: '0.65rem', iconSize: 14, borderRadius: 1.5 },
    medium: { height: 24, fontSize: '0.75rem', iconSize: 16, borderRadius: 2 },
    large: { height: 28, fontSize: '0.85rem', iconSize: 18, borderRadius: 2.5 },
  };
  
  const { height, fontSize, iconSize, borderRadius } = sizeProps[size];

  // --- Variant: Chip ---
  if (variant === 'chip') {
    return (
      <Tooltip title={config.description} arrow>
        <Chip
          icon={showIcon ? <IconComponent sx={{ fontSize: iconSize }} /> : undefined}
          label={showLabel ? config.label : ''}
          size={size === 'large' ? 'medium' : 'small'}
          sx={{
            background: config.gradient,
            color: 'white', // Ensure high contrast white text over gradient
            fontWeight: 600,
            fontSize: fontSize,
            height: height,
            borderRadius: borderRadius, // Use dynamic border radius
            animation: config.animation && `${config.animation} 2s infinite`,
            // Dark mode subtle elevation via shadow
            boxShadow: `0 2px 8px ${alpha(config.color, theme.palette.mode === 'dark' ? 0.3 : 0.6)}`,
            border: `1px solid ${alpha(config.color, 0.4)}`, // Subtle, defined border
            transition: 'all 0.3s',
            
            '& .MuiChip-icon': {
              color: 'white',
            },
            '&:hover': {
                transform: 'translateY(-1px) scale(1.02)', // Micro-interaction on hover
                boxShadow: `0 4px 12px ${alpha(config.color, theme.palette.mode === 'dark' ? 0.4 : 0.7)}`,
            }
          }}
        />
      </Tooltip>
    );
  }

  // --- Variant: Banner (For image overlays) ---
  if (variant === 'banner') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 3,
          background: config.gradient,
          color: 'white',
          px: 1.5,
          py: 0.5,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontSize: fontSize,
          fontWeight: 600,
          // Use a theme-aware shadow
          boxShadow: theme.shadows[4], 
          animation: config.animation && `${config.animation} 2s infinite`,
        }}
      >
        {showIcon && <IconComponent sx={{ fontSize: iconSize }} />}
        {showLabel && config.label}
      </Box>
    );
  }

  // --- Variant: Corner (Ribbon effect) ---
  if (variant === 'corner') {
    return (
      <Tooltip title={config.description} arrow>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 3,
            width: 0,
            height: 0,
            // Uses the primary color config.color
            borderLeft: '40px solid transparent',
            borderTop: `40px solid ${config.color}`,
            transition: 'all 0.3s',
            '&:hover': {
                filter: 'brightness(1.1)' // Slight brightness change on hover
            }
          }}
        >
          <IconComponent
            sx={{
              position: 'absolute',
              top: -35,
              right: -8,
              fontSize: 16,
              color: 'white', // White icon for contrast
              transform: 'rotate(45deg)',
            }}
          />
        </Box>
      </Tooltip>
    );
  }

  return null;
};

// --- Multiple Promotion Badges Container ---
export const PromotionBadges = ({ 
  promotions = [], 
  maxBadges = 2,
  size = 'medium',
  variant = 'chip',
  layout = 'horizontal'
}) => {
  if (!promotions || promotions.length === 0) return null;

  const activeBadges = promotions
    .filter(promo => promo && promo.type !== 'none')
    .slice(0, maxBadges);

  if (activeBadges.length === 0) return null;

  const containerProps = layout === 'horizontal' 
    ? { display: 'flex', gap: 0.5, flexWrap: 'wrap' }
    : { display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' };

  return (
    <Box sx={containerProps}>
      {activeBadges.map((promotion, index) => (
        <PromotionBadge
          key={index}
          type={promotion.type}
          size={size}
          variant={variant}
          // Only show icon on the first badge if multiple exist, for cleaner look
          showIcon={index === 0 || activeBadges.length === 1}
        />
      ))}
    </Box>
  );
};

// --- Enhanced Listing Card Overlay for Promoted Listings ---
export const PromotionOverlay = ({ promotion, children }) => {
  const theme = useTheme();
  const PROMOTION_CONFIGS = getPromotionConfigs(theme);

  if (!promotion || promotion.type === 'none') return children;

  const config = PROMOTION_CONFIGS[promotion.type];
  if (!config) return children;

  // Reduced border radius for a cleaner card look
  const borderRadius = '12px'; 

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      
      {/* 1. Promotion glow effect (Subtle, theme-aware outer glow) */}
      <Box
        sx={{
          position: 'absolute',
          top: -1, // Reduced size for subtlety
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: borderRadius,
          // Faded background effect for the glow
          background: `linear-gradient(135deg, ${alpha(config.color, 0.2)} 0%, transparent 50%, ${alpha(config.color, 0.2)} 100%)`,
          zIndex: 0, // Changed from -1 to 0 to sit *over* the main card's background, but under the content
          pointerEvents: 'none',
          opacity: 0.8, // Increased visibility slightly
        }}
      />
      
      {/* 2. Premium shine effect for featured+ (More pronounced for the highest tier) */}
      {promotion.type === 'featured_plus' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: borderRadius,
            // A subtle shine that moves across the card
            background: `linear-gradient(45deg, transparent 30%, ${alpha(config.color, 0.1)} 50%, transparent 70%)`,
            backgroundSize: '200% 200%',
            animation: `${shimmerAnimation} 3s infinite`,
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.5, // Subtle visual effect
          }}
        />
      )}
    </Box>
  );
};

// --- Promotion Stats Component for Listing Cards ---
export const PromotionStats = ({ promotion, compact = true }) => {
  const theme = useTheme();
  const PROMOTION_CONFIGS = getPromotionConfigs(theme);

  if (!promotion || promotion.type === 'none') return null;

  const config = PROMOTION_CONFIGS[promotion.type];
  if (!config) return null;

  const IconComponent = config.icon;
  const timeLeft = promotion.endDate ? Math.ceil((new Date(promotion.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  if (compact) {
    return (
      <Tooltip 
        title={`${config.label} promotion - ${timeLeft} days remaining`} 
        arrow
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: config.color,
            fontSize: '0.75rem',
            fontWeight: 600,
            transition: 'color 0.3s',
            // Subtle pulse for urgent/expiring promotions
            animation: config.animation && `${config.animation} 2s infinite`,
            '&:hover': {
                color: alpha(config.color, 0.8),
            }
          }}
        >
          <IconComponent sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
            {timeLeft}d left
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  // Full Stats Banner
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1.5,
        borderRadius: '10px',
        // Theme-aware, subtle background
        background: alpha(config.color, theme.palette.mode === 'dark' ? 0.05 : 0.1),
        border: `1px solid ${alpha(config.color, theme.palette.mode === 'dark' ? 0.3 : 0.4)}`,
      }}
    >
      <IconComponent sx={{ fontSize: 20, color: config.color }} />
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: config.color }}>
          {config.label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
          {config.description} ({timeLeft} days remaining)
        </Typography>
      </Box>
    </Box>
  );
};

// --- Promotion Action Button for Listing Management ---
export const PromotionActionButton = ({ 
  hasPromotion, 
  onClick,
  size = 'small',
  variant = 'outlined' 
}) => {
  const theme = useTheme();
  
  // Use theme colors for the primary button appearance
  const primaryColor = theme.palette.primary.main;
  const primaryDark = theme.palette.primary.dark;
  
  // Custom gradient for the promoted state
  const promotedGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`;

  return (
    <Tooltip title={hasPromotion ? 'Manage promotion' : 'Promote this listing'} arrow>
      <Chip
        icon={<AutoAwesome sx={{ fontSize: 16 }} />}
        label={hasPromotion ? 'Promoted' : 'Promote'}
        onClick={onClick}
        variant={variant}
        size={size}
        sx={{
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.3s',
          
          // --- Promoted State (Contained Gradient) ---
          ...(hasPromotion && {
            background: promotedGradient,
            color: 'white',
            borderColor: 'transparent',
            boxShadow: theme.shadows[3],
            '&:hover': {
              background: promotedGradient, // Keep gradient on hover
              opacity: 0.9,
              transform: 'translateY(-1px)',
              boxShadow: theme.shadows[6],
            },
            '& .MuiChip-icon': {
              color: 'white',
            },
          }),
          
          // --- Default State (Outlined) ---
          ...(!hasPromotion && {
            color: primaryColor,
            borderColor: primaryColor,
            background: 'transparent',
            '&:hover': {
              background: alpha(primaryColor, theme.palette.mode === 'dark' ? 0.1 : 0.05),
              borderColor: primaryColor,
              transform: 'translateY(-1px)',
            },
            '& .MuiChip-icon': {
              color: primaryColor,
            },
          }),
        }}
      />
    </Tooltip>
  );
};

export default PromotionBadges;