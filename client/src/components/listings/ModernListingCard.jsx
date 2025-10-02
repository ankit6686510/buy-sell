import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  LocationOn,
  FavoriteBorder,
  Favorite,
  Visibility,
  Schedule,
  Share,
  WhatsApp,
} from '@mui/icons-material';
import SellerBadges from '../badges/SellerBadges';
import { PromotionBadge, PromotionOverlay, PromotionActionButton } from '../promotions/PromotionBadges';
import PromotionPackages from '../promotions/PromotionPackages';

const conditionLabels = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const getConditionColor = (condition) => {
  switch (condition) {
    case 'new':
      return '#22c55e';
    case 'like_new':
      return '#16a34a';
    case 'good':
      return '#3b82f6';
    case 'fair':
      return '#f59e0b';
    case 'poor':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const ModernListingCard = ({ listing, isLoading = false }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  if (isLoading) {
    return (
      <Card 
        sx={{ 
          height: 380,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
        }}
      >
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton variant="text" height={32} width="80%" />
          <Skeleton variant="text" height={24} width="60%" />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rounded" width={60} height={24} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Box>
          <Skeleton variant="text" height={20} width="70%" sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const {
    _id,
    title,
    brand,
    category,
    condition,
    price,
    images,
    location,
    status,
    createdAt,
    user,
    views = 0,
    description,
    promotion = { type: 'none' }, // Default to no promotion
  } = listing;

  // Mock promotion data for demonstration
  const mockPromotion = Math.random() > 0.7 ? {
    type: ['spotlight', 'top_ads', 'urgent', 'featured_plus'][Math.floor(Math.random() * 4)],
    endDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    views: Math.floor(Math.random() * 100) + 50,
    clicks: Math.floor(Math.random() * 20) + 5,
  } : { type: 'none' };

  const activePromotion = promotion.type !== 'none' ? promotion : mockPromotion;

  const handleClick = () => {
    navigate(`/listings/${_id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    const productTitle = title || `${brand} ${category}`;
    const shareText = `🛒 Check out this amazing ${category}!\n\n` +
                     `📱 ${productTitle}\n` +
                     `💰 Price: ₹${price}\n` +
                     `📍 Location: ${displayLocation}\n` +
                     `✨ Condition: ${conditionLabels[condition] || condition}\n\n` +
                     `${description ? `📝 ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}\n\n` : ''}` +
                     `🔗 View details: ${window.location.origin}/listings/${_id}\n\n` +
                     `Found on SecondMarket 🏪`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffInHours = (now - created) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return created.toLocaleDateString();
  };

  const displayLocation = typeof location === 'string' 
    ? location 
    : location?.address || location?.city || 'Location not specified';

  const handlePromoteClick = (e) => {
    e.stopPropagation();
    setShowPromotionDialog(true);
  };

  const handlePromotionSubmit = (promotionData) => {
    console.log('Promotion submitted:', promotionData);
    // Here you would integrate with payment gateway
    setShowPromotionDialog(false);
  };

  return (
    <PromotionOverlay promotion={activePromotion}>
      <Card 
        onClick={handleClick}
        sx={{ 
          height: 380,
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 25px 50px rgba(85, 40, 111, 0.25)',
            background: 'rgba(255, 255, 255, 0.85)',
            '& .price-tag': {
              transform: 'scale(1.1)',
            },
            '& .image-overlay': {
              opacity: 1,
            },
          },
        }}
      >
      {/* Status Badge */}
      {status && status !== 'available' && (
        <Chip 
          label={status === 'matched' ? 'Matched' : 'Sold'} 
          color={status === 'matched' ? 'secondary' : 'default'} 
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            background: status === 'matched' ? 'linear-gradient(135deg, #BC96E6 0%, #AE759F 100%)' : 'rgba(0,0,0,0.7)',
            color: 'white',
            fontWeight: 600,
          }}
        />
      )}

      {/* Favorite Button */}
      <IconButton
        onClick={handleFavoriteClick}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          width: 36,
          height: 36,
          '&:hover': {
            background: 'rgba(255, 255, 255, 1)',
            transform: 'scale(1.1)',
          },
        }}
      >
        {isFavorite ? 
          <Favorite sx={{ color: '#ef4444', fontSize: 20 }} /> : 
          <FavoriteBorder sx={{ color: '#6b7280', fontSize: 20 }} />
        }
      </IconButton>

      {/* Image Section */}
      <Box sx={{ position: 'relative', height: 200 }}>
        <CardMedia
          component="img"
          height="200"
          image={images && images.length > 0 ? images[0] : 'https://via.placeholder.com/300x200?text=Product'}
          alt={title || `${brand} ${category}` || 'Product'}
          onLoad={() => setImageLoaded(true)}
          sx={{ 
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
        />
        
        {/* Image Overlay */}
        <Box
          className="image-overlay"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <Visibility sx={{ fontSize: 16 }} />
            <Typography variant="caption">{views} views</Typography>
          </Box>
          
          {/* WhatsApp Share Button */}
          <IconButton
            onClick={handleWhatsAppShare}
            sx={{
              background: 'rgba(37, 211, 102, 0.9)',
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': {
                background: '#25d366',
                transform: 'scale(1.1)',
              },
            }}
          >
            <WhatsApp sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.1rem',
                lineHeight: 1.2,
                mb: 0.5,
                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {title || `${brand || ''} ${category || 'Product'}`.trim()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              {category && category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
              {brand && ` • ${brand}`}
            </Typography>
          </Box>
          
          <Box
            className="price-tag"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'transform 0.2s ease',
            }}
          >
            ₹{price?.toLocaleString('en-IN') || '0'}
          </Box>
        </Box>
        
        {/* Condition Chip */}
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={conditionLabels[condition] || condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} 
            sx={{
              background: `linear-gradient(135deg, ${getConditionColor(condition)}15 0%, ${getConditionColor(condition)}25 100%)`,
              color: getConditionColor(condition),
              border: `1px solid ${getConditionColor(condition)}40`,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
            size="small" 
          />
        </Box>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn 
            sx={{ 
              fontSize: 16, 
              color: '#6b7280', 
              mr: 0.5 
            }} 
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: '0.85rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayLocation}
          </Typography>
        </Box>
        
        {/* Footer */}
        <Box sx={{ mt: 'auto' }}>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={user.avatar} 
                  alt={user.name}
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    mr: 1,
                    border: '2px solid rgba(99, 102, 241, 0.2)',
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  {user.name}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <Schedule sx={{ fontSize: 14, mr: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {formatTimeAgo(createdAt)}
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Seller Badges */}
          {user && (
            <SellerBadges 
              userStats={{
                totalSales: user.totalSales || Math.floor(Math.random() * 50) + 5,
                averageRating: user.averageRating || (4.0 + Math.random() * 1),
                totalReviews: user.totalReviews || Math.floor(Math.random() * 20) + 3,
                responseTime: user.responseTime || Math.floor(Math.random() * 4) + 1,
                memberSince: user.memberSince || new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                isVerified: user.isVerified || Math.random() > 0.4,
                positiveReviewPercentage: user.positiveReviewPercentage || (90 + Math.random() * 10),
                averageShippingTime: user.averageShippingTime || Math.floor(Math.random() * 48) + 12,
                completedProfile: user.completedProfile || Math.random() > 0.3,
              }}
              maxBadges={2}
              showTrustScore={true}
              size="small"
              layout="horizontal"
            />
          )}
        </Box>
      </CardContent>

      {/* Promotion Badge */}
      {activePromotion && activePromotion.type !== 'none' && (
        <PromotionBadge 
          type={activePromotion.type}
          variant="banner"
          size="small"
        />
      )}

      {/* Promotion Action Button */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          zIndex: 2,
        }}
      >
        <PromotionActionButton
          hasPromotion={activePromotion.type !== 'none'}
          onClick={handlePromoteClick}
          size="small"
        />
      </Box>
    </Card>

    {/* Promotion Dialog */}
    <PromotionPackages
      listingId={_id}
      isOpen={showPromotionDialog}
      onClose={() => setShowPromotionDialog(false)}
      onPromote={handlePromotionSubmit}
      currentPromotion={activePromotion}
    />
  </PromotionOverlay>
  );
};

export default ModernListingCard;
