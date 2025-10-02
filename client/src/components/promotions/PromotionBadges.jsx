import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography,
  keyframes,
} from '@mui/material';
import {
  Visibility,
  TrendingUp,
  FlashOn,
  EmojiEvents,
  Star,
  AutoAwesome,
} from '@mui/icons-material';

// Animation for urgent badge
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Animation for spotlight badge
const shimmerAnimation = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

// Promotion badge configurations
const PROMOTION_CONFIGS = {
  spotlight: {
    icon: Visibility,
    label: 'Spotlight',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    description: 'Featured in spotlight section',
    animation: shimmerAnimation,
  },
  top_ads: {
    icon: TrendingUp,
    label: 'Top Ad',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    description: 'Premium placement at top',
    animation: null,
  },
  urgent: {
    icon: FlashOn,
    label: 'Urgent',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    description: 'Quick sale needed',
    animation: pulseAnimation,
  },
  featured_plus: {
    icon: EmojiEvents,
    label: 'Featured+',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    description: 'Premium featured listing',
    animation: null,
  },
};

// Individual promotion badge component
export const PromotionBadge = ({ 
  type, 
  size = 'medium', 
  variant = 'chip',
  showIcon = true,
  showLabel = true 
}) => {
  if (!type || type === 'none' || !PROMOTION_CONFIGS[type]) return null;

  const config = PROMOTION_CONFIGS[type];
  const IconComponent = config.icon;

  const sizeProps = {
    small: { height: 20, fontSize: '0.65rem', iconSize: 14 },
    medium: { height: 24, fontSize: '0.75rem', iconSize: 16 },
    large: { height: 28, fontSize: '0.85rem', iconSize: 18 },
  };

  if (variant === 'chip') {
    return (
      <Tooltip title={config.description} arrow>
        <Chip
          icon={showIcon ? <IconComponent sx={{ fontSize: sizeProps[size].iconSize }} /> : undefined}
          label={showLabel ? config.label : ''}
          size={size === 'large' ? 'medium' : 'small'}
          sx={{
            background: config.gradient,
            color: 'white',
            fontWeight: 600,
            fontSize: sizeProps[size].fontSize,
            height: sizeProps[size].height,
            animation: config.animation && `${config.animation} 2s infinite`,
            '& .MuiChip-icon': {
              color: 'white',
            },
            boxShadow: `0 2px 8px ${config.color}40`,
            border: `1px solid ${config.color}20`,
          }}
        />
      </Tooltip>
    );
  }

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
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontSize: sizeProps[size].fontSize,
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          animation: config.animation && `${config.animation} 2s infinite`,
        }}
      >
        {showIcon && <IconComponent sx={{ fontSize: sizeProps[size].iconSize }} />}
        {showLabel && config.label}
      </Box>
    );
  }

  if (variant === 'corner') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 3,
          width: 0,
          height: 0,
          borderLeft: '40px solid transparent',
          borderTop: `40px solid ${config.color}`,
        }}
      >
        <IconComponent
          sx={{
            position: 'absolute',
            top: -35,
            right: -8,
            fontSize: 16,
            color: 'white',
            transform: 'rotate(45deg)',
          }}
        />
      </Box>
    );
  }

  return null;
};

// Multiple promotion badges container
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
        />
      ))}
    </Box>
  );
};

// Enhanced listing card overlay for promoted listings
export const PromotionOverlay = ({ promotion, children }) => {
  if (!promotion || promotion.type === 'none') return children;

  const config = PROMOTION_CONFIGS[promotion.type];
  if (!config) return children;

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      
      {/* Promotion glow effect */}
      <Box
        sx={{
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: '26px',
          background: `linear-gradient(135deg, ${config.color}40, transparent, ${config.color}40)`,
          zIndex: -1,
          opacity: 0.6,
        }}
      />
      
      {/* Premium shine effect for featured+ */}
      {promotion.type === 'featured_plus' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '24px',
            background: `linear-gradient(45deg, transparent 30%, ${config.color}15 50%, transparent 70%)`,
            backgroundSize: '200% 200%',
            animation: `${shimmerAnimation} 3s infinite`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
    </Box>
  );
};

// Promotion stats component for listing cards
export const PromotionStats = ({ promotion, compact = true }) => {
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
          }}
        >
          <IconComponent sx={{ fontSize: 14 }} />
          <Typography variant="caption">
            {timeLeft}d left
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: '8px',
        background: `${config.color}10`,
        border: `1px solid ${config.color}30`,
      }}
    >
      <IconComponent sx={{ fontSize: 16, color: config.color }} />
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, color: config.color }}>
          {config.label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {timeLeft} days remaining
        </Typography>
      </Box>
    </Box>
  );
};

// Promotion action button for listing management
export const PromotionActionButton = ({ 
  hasPromotion, 
  onClick,
  size = 'small',
  variant = 'outlined' 
}) => {
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
          background: hasPromotion 
            ? 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)'
            : 'transparent',
          color: hasPromotion ? 'white' : '#6366f1',
          borderColor: '#6366f1',
          fontWeight: 600,
          '&:hover': {
            background: hasPromotion 
              ? 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)'
              : 'rgba(99, 102, 241, 0.1)',
          },
          '& .MuiChip-icon': {
            color: hasPromotion ? 'white' : '#6366f1',
          },
        }}
      />
    </Tooltip>
  );
};

export default PromotionBadges;
