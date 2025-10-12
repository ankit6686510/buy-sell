import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CardActionArea,
  Avatar,
  useTheme, // <-- Imported useTheme for shadow control
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
    case 'fair': // Adjusted fair to use warning only
      return 'warning'; 
    case 'poor':
      return 'error';
    default:
      return 'info'; // Use info for a neutral "Good" or default case
  }
};

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  const theme = useTheme(); // <-- Hooked into the theme
  
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

  // Improved date formatting for cleaner display
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
  });

  return (
    <Card 
      elevation={2} // Start with a subtle default elevation
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '12px', // Use consistent rounding from theme
        overflow: 'hidden', // Ensures image respects border radius
        border: `1px solid ${theme.palette.divider}`, // Subtle border for definition in both modes
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)', // Deeper lift
          boxShadow: theme.shadows[10], // Use a high shadow for a premium, lifted effect
        },
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Card Media (Image) */}
        <CardMedia
          component="img"
          height="200"
          image={images && images.length > 0 ? images[0] : '/placeholder.jpg'}
          alt={`${brand} ${model} earbud`}
          sx={{ 
            objectFit: 'cover',
            width: '100%',
            // Subtle transition on the image itself
            transition: 'transform 0.3s',
            '&:hover': {
                transform: 'scale(1.02)'
            }
          }}
        />
        
        {/* Card Content */}
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          
          {/* Price and Title */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ 
              fontWeight: 700, 
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '70%',
            }}>
              {brand} {model}
            </Typography>
            <Typography variant="h5" color="primary" sx={{ 
              fontWeight: 800,
              fontSize: '1.4rem' // Slightly larger price
            }}>
              ${price}
            </Typography>
          </Box>
          
          {/* Chips (Side, Condition, Status) */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={side.charAt(0).toUpperCase() + side.slice(1)} 
              color="secondary" // Changed to secondary for less visual conflict with price
              variant="filled" // Used filled for better pop
              size="small" 
            />
            <Chip 
              label={conditionLabels[condition] || condition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} 
              color={getConditionColor(condition)} 
              variant="outlined"
              size="small" 
              sx={{ fontWeight: 600 }}
            />
            {status && status !== 'available' && (
              <Chip 
                label={status === 'matched' ? 'Pending Match' : 'Sold'} 
                color={status === 'matched' ? 'info' : 'error'} // More distinct status colors
                variant="filled"
                size="small" 
              />
            )}
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn fontSize="small" color="action" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {typeof location === 'string' 
                ? location 
                : location?.address || location?.city || 'Location unspecified'}
            </Typography>
          </Box>
          
          {/* User and Date */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={user.avatar} 
                  alt={user.name}
                  sx={{ width: 28, height: 28, mr: 1, bgcolor: 'primary.light' }} // Slightly larger avatar
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.name}
                </Typography>
              </Box>
              {createdAt && (
                <Typography variant="caption" color="text.disabled">
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