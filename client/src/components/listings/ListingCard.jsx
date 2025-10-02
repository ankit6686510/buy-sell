import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CardActionArea,
  Avatar,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';

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
      return 'success';
    case 'like_new':
      return 'success';
    case 'good':
      return 'info';
    case 'fair':
      return 'warning';
    case 'poor':
      return 'error';
    default:
      return 'default';
  }
};

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  
  const {
    _id,
    brand,
    model,
    side,
    condition,
    price,
    images,
    location,
    status,
    createdAt,
    user,
  } = listing;

  const handleClick = () => {
    navigate(`/listings/${_id}`);
  };

  const formattedDate = new Date(createdAt).toLocaleDateString();

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      <CardActionArea onClick={handleClick}>
        <CardMedia
          component="img"
          height="200"
          image={images && images.length > 0 ? images[0] : '/placeholder.jpg'}
          alt={`${brand} ${model} earbud`}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500, mb: 0.5 }}>
              {brand} {model}
            </Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              ${price}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={side.charAt(0).toUpperCase() + side.slice(1)} 
              color="primary" 
              variant="outlined"
              size="small" 
            />
            <Chip 
              label={conditionLabels[condition] || condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} 
              color={getConditionColor(condition)} 
              variant="outlined"
              size="small" 
            />
            {status && status !== 'available' && (
              <Chip 
                label={status === 'matched' ? 'Matched' : 'Sold'} 
                color={status === 'matched' ? 'secondary' : 'default'} 
                size="small" 
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {typeof location === 'string' 
                ? location 
                : location?.address || location?.city || 'Location not specified'}
            </Typography>
          </Box>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={user.avatar} 
                  alt={user.name}
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {user.name}
                </Typography>
              </Box>
              {createdAt && (
                <Typography variant="caption" color="text.secondary">
                  {formattedDate}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ListingCard;
