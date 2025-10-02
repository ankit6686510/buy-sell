import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
  Slide,
  Grow,
} from '@mui/material';
import { Close, EmojiEvents } from '@mui/icons-material';
import { BadgeChip } from './SellerBadges';

const BadgeNotification = ({ 
  badge, 
  isOpen, 
  onClose, 
  autoHideDuration = 6000,
  variant = 'achievement' 
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    }
  }, [isOpen]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  if (!badge) return null;

  const IconComponent = badge.icon;

  if (variant === 'achievement') {
    return (
      <Snackbar
        open={show}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'left' }}
      >
        <Alert
          severity="success"
          onClose={handleClose}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            color: 'white',
            minWidth: 320,
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
            '& .MuiAlert-icon': {
              color: 'white',
            },
            '& .MuiAlert-action': {
              color: 'white',
            },
          }}
          icon={<EmojiEvents />}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              🎉 New Badge Earned!
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: badge.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <IconComponent sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {badge.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                  {badge.description}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
              Criteria: {badge.criteria}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    );
  }

  // Compact variant for multiple badge notifications
  return (
    <Snackbar
      open={show}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={Grow}
    >
      <Alert
        severity="info"
        onClose={handleClose}
        sx={{
          background: badge.gradient,
          color: 'white',
          borderRadius: '12px',
          '& .MuiAlert-icon': {
            color: 'white',
          },
          '& .MuiAlert-action': {
            color: 'white',
          },
        }}
        icon={<IconComponent />}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Badge Earned: {badge.name}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

// Badge Progress Component
export const BadgeProgress = ({ 
  badge, 
  currentValue, 
  targetValue, 
  unit = '',
  compact = false 
}) => {
  const progress = Math.min((currentValue / targetValue) * 100, 100);
  const IconComponent = badge.icon;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
        <IconComponent sx={{ fontSize: 20, color: badge.color }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {badge.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                flex: 1,
                height: 4,
                borderRadius: '2px',
                background: '#e5e7eb',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${progress}%`,
                  height: '100%',
                  background: badge.gradient,
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {currentValue}/{targetValue}{unit}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '12px',
        border: `1px solid ${badge.color}40`,
        background: `${badge.color}05`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: badge.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconComponent sx={{ fontSize: 20, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {badge.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {badge.description}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentValue}/{targetValue}{unit} ({Math.round(progress)}%)
          </Typography>
        </Box>
        <Box
          sx={{
            height: 8,
            borderRadius: '4px',
            background: '#e5e7eb',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: '100%',
              background: badge.gradient,
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
      </Box>
      
      <Typography variant="caption" color="text.secondary">
        {badge.criteria}
      </Typography>
    </Box>
  );
};

// Multiple Badge Notifications Manager
export const BadgeNotificationManager = ({ 
  badges = [], 
  onClose,
  staggerDelay = 1000 
}) => {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [showCurrent, setShowCurrent] = useState(false);

  useEffect(() => {
    if (badges.length > 0 && currentBadgeIndex < badges.length) {
      setShowCurrent(true);
    }
  }, [badges, currentBadgeIndex]);

  const handleClose = () => {
    setShowCurrent(false);
    
    setTimeout(() => {
      if (currentBadgeIndex < badges.length - 1) {
        setCurrentBadgeIndex(prev => prev + 1);
      } else {
        setCurrentBadgeIndex(0);
        onClose();
      }
    }, 300);
  };

  if (badges.length === 0) return null;

  return (
    <BadgeNotification
      badge={badges[currentBadgeIndex]}
      isOpen={showCurrent}
      onClose={handleClose}
      autoHideDuration={4000}
    />
  );
};

export default BadgeNotification;
