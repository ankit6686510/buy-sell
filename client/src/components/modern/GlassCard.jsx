import React from 'react';
import { Card, Box, useTheme, alpha } from '@mui/material';

// ----------------------------------------------------------------------
// FIX: Define default/placeholder constants as they were not imported.
// These should ideally be defined and exported from your main MUI theme file.
// ----------------------------------------------------------------------

// Placeholder for Glassmorphism styles (standard default values)
const glassMorphism = {
  light: {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)', // Subtle dark shadow
    border: '1px solid rgba(255, 255, 255, 0.4)',
  },
  dark: {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', // Stronger dark shadow
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

// Placeholder for animation (we'll use a simple CSS keyframe for fadeIn)
const animations = {
  fadeIn: 'fadeIn 0.5s ease-out',
  // Define keyframes in a global stylesheet or use MUI's system for injection
};
// Add keyframes placeholder to ensure the animation property is valid
const FadeInKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
// ----------------------------------------------------------------------

/**
 * A highly polished Card component implementing a Glassmorphism effect.
 * It is fully theme-aware and includes a subtle hover lift.
 */
const GlassCard = ({ 
  children, 
  hover = true, 
  animation = 'fadeIn', 
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // CRITICAL FIX: Inject the keyframe style globally if it doesn't exist
  React.useEffect(() => {
    if (animation === 'fadeIn' && !document.getElementById('fadeIn-keyframe')) {
      const style = document.createElement('style');
      style.id = 'fadeIn-keyframe';
      style.innerHTML = FadeInKeyframes;
      document.head.appendChild(style);
    }
  }, [animation]);
  
  // Custom shadow for high-lift hover (if theme shadows are defined, use them, otherwise use a custom gradient shadow)
  const hoverShadow = theme.shadows[10] || 
    (isDark 
      ? `0 20px 40px ${alpha(theme.palette.common.black, 0.5)}` 
      : `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`);

  return (
    <Card
      // CRITICAL: Ensure elevation is 0, as we are managing the shadow and background entirely via CSS/SX
      elevation={0}
      sx={{
        // Base Glassmorphism Styles (The previously undefined object is now defined)
        ...glassMorphism[isDark ? 'dark' : 'light'],
        
        // Use the defined animation (safely check if the animation exists in the placeholder)
        ...(animations[animation] && { animation: animations[animation] }),
        
        // General styling for the Card container
        borderRadius: '16px', // Standardized large radius for premium look
        overflow: 'visible', // Changed to visible to allow box-shadow to display correctly
        
        // Ensure smooth transitions for all changes
        transition: theme.transitions.create(['transform', 'box-shadow', 'background'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
        }),
        
        // Hover State Polish
        ...(hover && {
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-6px)', // Slightly reduced translation for balance
            boxShadow: hoverShadow,        // Uses the calculated premium shadow
          }
        }),
        
        // Merge any custom styles passed in props
        ...sx
      }}
      {...props}
    >
      {/* The original comment regarding CardContent is valid.
        We'll use a Box with standard padding (theme.spacing(3) = 24px default) 
        to ensure content padding while keeping the Card element purely for the glass effect.
      */}
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {children}
      </Box>
    </Card>
  );
};

export default GlassCard;