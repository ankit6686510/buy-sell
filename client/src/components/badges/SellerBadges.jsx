import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography,
  Stack,
} from '@mui/material';
import {
  Verified,
  Speed,
  AttachMoney,
  Recycling,
  Star,
  LocalShipping,
  Handshake,
  TrendingUp,
  EmojiEvents,
  Security,
} from '@mui/icons-material';

// Badge definitions with criteria and rewards
export const BADGE_TYPES = {
  // Trust & Reliability Badges
  VERIFIED_SELLER: {
    id: 'verified_seller',
    name: 'Verified Seller',
    icon: Verified,
    color: '#22c55e',
    description: 'Phone number and email verified',
    criteria: 'Complete profile verification',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  },
  QUICK_SHIPPER: {
    id: 'quick_shipper',
    name: 'Quick Shipper',
    icon: Speed,
    color: '#3b82f6',
    description: 'Ships items within 24 hours',
    criteria: '90% of orders shipped within 24h',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  FAIR_PRICER: {
    id: 'fair_pricer',
    name: 'Fair Pricer',
    icon: AttachMoney,
    color: '#f59e0b',
    description: 'Prices items competitively',
    criteria: 'Prices within market range',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  
  // Performance Badges
  TOP_RATED: {
    id: 'top_rated',
    name: 'Top Rated',
    icon: Star,
    color: '#fbbf24',
    description: 'Maintains 4.5+ star rating',
    criteria: 'Average rating 4.5+ with 10+ reviews',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  },
  RELIABLE_SELLER: {
    id: 'reliable_seller',
    name: 'Reliable Seller',
    icon: Handshake,
    color: '#6366f1',
    description: 'Consistent positive feedback',
    criteria: '95%+ positive reviews',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
  },
  FAST_RESPONDER: {
    id: 'fast_responder',
    name: 'Fast Responder',
    icon: LocalShipping,
    color: '#8b5cf6',
    description: 'Responds to messages quickly',
    criteria: 'Average response time < 2 hours',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  
  // Special Achievement Badges
  ECO_WARRIOR: {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    icon: Recycling,
    color: '#10b981',
    description: 'Promoting sustainable shopping',
    criteria: 'Sold 50+ second-hand items',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  RISING_STAR: {
    id: 'rising_star',
    name: 'Rising Star',
    icon: TrendingUp,
    color: '#ef4444',
    description: 'New seller with great reviews',
    criteria: 'New seller (< 3 months) with 4.5+ rating',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  MARKETPLACE_CHAMPION: {
    id: 'marketplace_champion',
    name: 'Champion',
    icon: EmojiEvents,
    color: '#f97316',
    description: 'Top performing seller',
    criteria: '100+ successful sales',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  },
  TRUSTED_MEMBER: {
    id: 'trusted_member',
    name: 'Trusted Member',
    icon: Security,
    color: '#0ea5e9',
    description: 'Long-standing community member',
    criteria: 'Member for 1+ year with good standing',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  },
};

// Trust score calculation
export const calculateTrustScore = (userStats) => {
  const {
    totalSales = 0,
    averageRating = 0,
    totalReviews = 0,
    responseTime = 24, // hours
    memberSince = new Date(),
    completedProfile = false,
    positiveReviewPercentage = 0,
    averageShippingTime = 48, // hours
  } = userStats;

  let score = 0;

  // Base score from sales volume (0-25 points)
  score += Math.min(totalSales * 0.5, 25);

  // Rating contribution (0-25 points)
  if (totalReviews >= 5) {
    score += (averageRating / 5) * 25;
  }

  // Review volume bonus (0-15 points)
  score += Math.min(totalReviews * 0.3, 15);

  // Response time bonus (0-10 points)
  if (responseTime <= 1) score += 10;
  else if (responseTime <= 2) score += 8;
  else if (responseTime <= 6) score += 5;
  else if (responseTime <= 24) score += 2;

  // Profile completion bonus (0-10 points)
  if (completedProfile) score += 10;

  // Positive review percentage (0-10 points)
  score += (positiveReviewPercentage / 100) * 10;

  // Shipping speed bonus (0-5 points)
  if (averageShippingTime <= 24) score += 5;
  else if (averageShippingTime <= 48) score += 3;

  // Longevity bonus (0-5 points)
  const daysSinceMember = (new Date() - new Date(memberSince)) / (1000 * 60 * 60 * 24);
  if (daysSinceMember >= 365) score += 5;
  else if (daysSinceMember >= 180) score += 3;
  else if (daysSinceMember >= 90) score += 1;

  return Math.min(Math.round(score), 100);
};

// Determine which badges a user has earned
export const calculateEarnedBadges = (userStats) => {
  const badges = [];
  const {
    totalSales = 0,
    averageRating = 0,
    totalReviews = 0,
    responseTime = 24,
    memberSince = new Date(),
    isVerified = false,
    positiveReviewPercentage = 0,
    averageShippingTime = 48,
  } = userStats;

  const daysSinceMember = (new Date() - new Date(memberSince)) / (1000 * 60 * 60 * 24);

  // Verified Seller
  if (isVerified) {
    badges.push(BADGE_TYPES.VERIFIED_SELLER);
  }

  // Quick Shipper
  if (averageShippingTime <= 24 && totalSales >= 5) {
    badges.push(BADGE_TYPES.QUICK_SHIPPER);
  }

  // Fair Pricer (simplified - would need market analysis in real app)
  if (totalSales >= 10 && averageRating >= 4.0) {
    badges.push(BADGE_TYPES.FAIR_PRICER);
  }

  // Top Rated
  if (averageRating >= 4.5 && totalReviews >= 10) {
    badges.push(BADGE_TYPES.TOP_RATED);
  }

  // Reliable Seller
  if (positiveReviewPercentage >= 95 && totalReviews >= 5) {
    badges.push(BADGE_TYPES.RELIABLE_SELLER);
  }

  // Fast Responder
  if (responseTime <= 2) {
    badges.push(BADGE_TYPES.FAST_RESPONDER);
  }

  // Eco Warrior
  if (totalSales >= 50) {
    badges.push(BADGE_TYPES.ECO_WARRIOR);
  }

  // Rising Star
  if (daysSinceMember <= 90 && averageRating >= 4.5 && totalReviews >= 5) {
    badges.push(BADGE_TYPES.RISING_STAR);
  }

  // Marketplace Champion
  if (totalSales >= 100) {
    badges.push(BADGE_TYPES.MARKETPLACE_CHAMPION);
  }

  // Trusted Member
  if (daysSinceMember >= 365 && averageRating >= 4.0) {
    badges.push(BADGE_TYPES.TRUSTED_MEMBER);
  }

  return badges;
};

// Trust Score Component
export const TrustScore = ({ score, size = 'medium', showLabel = true }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'New';
  };

  const sizeProps = {
    small: { width: 24, height: 24, fontSize: '0.7rem' },
    medium: { width: 32, height: 32, fontSize: '0.8rem' },
    large: { width: 40, height: 40, fontSize: '0.9rem' },
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          ...sizeProps[size],
          borderRadius: '50%',
          background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, #e5e7eb 0deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: `${sizeProps[size].width - 6}px`,
            height: `${sizeProps[size].height - 6}px`,
            borderRadius: '50%',
            background: 'white',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: sizeProps[size].fontSize,
            fontWeight: 700,
            color: getScoreColor(score),
            position: 'relative',
            zIndex: 1,
          }}
        >
          {score}
        </Typography>
      </Box>
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: getScoreColor(score),
          }}
        >
          {getScoreLabel(score)}
        </Typography>
      )}
    </Box>
  );
};

// Individual Badge Component
export const BadgeChip = ({ badge, size = 'small', variant = 'compact' }) => {
  const IconComponent = badge.icon;
  
  if (variant === 'compact') {
    return (
      <Tooltip title={`${badge.name}: ${badge.description}`} arrow>
        <Chip
          icon={<IconComponent sx={{ fontSize: size === 'small' ? 14 : 16 }} />}
          label={badge.name}
          size={size}
          sx={{
            background: badge.gradient,
            color: 'white',
            fontWeight: 600,
            fontSize: size === 'small' ? '0.65rem' : '0.75rem',
            height: size === 'small' ? 20 : 24,
            '& .MuiChip-icon': {
              color: 'white',
            },
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        />
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
        borderRadius: '12px',
        background: badge.gradient,
        color: 'white',
        minWidth: 120,
      }}
    >
      <IconComponent sx={{ fontSize: 20 }} />
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
          {badge.name}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
          {badge.description}
        </Typography>
      </Box>
    </Box>
  );
};

// Main Seller Badges Component
const SellerBadges = ({ 
  userStats, 
  maxBadges = 3, 
  showTrustScore = true, 
  size = 'small',
  layout = 'horizontal' 
}) => {
  const earnedBadges = calculateEarnedBadges(userStats);
  const trustScore = calculateTrustScore(userStats);
  const displayBadges = earnedBadges.slice(0, maxBadges);

  if (layout === 'vertical') {
    return (
      <Stack spacing={1} alignItems="flex-start">
        {showTrustScore && <TrustScore score={trustScore} size={size} />}
        {displayBadges.map((badge) => (
          <BadgeChip key={badge.id} badge={badge} size={size} />
        ))}
        {earnedBadges.length > maxBadges && (
          <Typography variant="caption" color="text.secondary">
            +{earnedBadges.length - maxBadges} more
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      {showTrustScore && <TrustScore score={trustScore} size={size} showLabel={false} />}
      {displayBadges.map((badge) => (
        <BadgeChip key={badge.id} badge={badge} size={size} />
      ))}
      {earnedBadges.length > maxBadges && (
        <Tooltip title={`${earnedBadges.length - maxBadges} more badges`}>
          <Chip
            label={`+${earnedBadges.length - maxBadges}`}
            size={size}
            variant="outlined"
            sx={{
              fontSize: size === 'small' ? '0.65rem' : '0.75rem',
              height: size === 'small' ? 20 : 24,
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default SellerBadges;
