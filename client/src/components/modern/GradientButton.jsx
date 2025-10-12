import React from 'react';
import { Button, useTheme, alpha } from '@mui/material';
import { gradients } from '../../theme'; // Assuming this imports your gradients object

const GradientButton = ({ 
  children, 
  variant = 'contained',
  gradient = 'primary',
  hover = true,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const getGradient = () => {
    switch (gradient) {
      case 'primary':
        return gradients.primary;
      case 'secondary':
        return gradients.secondary;
      case 'success':
        return gradients.success;
      case 'rainbow':
        return gradients.rainbow;
      case 'sunset':
        return gradients.sunset;
      case 'ocean':
        return gradients.ocean;
      default:
        return gradients.primary;
    }
  };

  // --- Theme-Aware Hover Shadow ---
  // Creating a custom, softer shadow that adapts to dark mode.
  const hoverShadow = isDark 
    ? `0 10px 30px ${alpha(theme.palette.common.black, 0.7)}` // Darker, more pronounced shadow in dark mode
    : `0 10px 30px ${alpha(theme.palette.primary.main, 0.5)}`; // Lighter, primary-colored shadow in light mode

  const baseStyles = {
    borderRadius: 2,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1, // Ensure text is above the background/pseudo-elements
    
    // Default ::before element for the contained variant or a base for hover
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: getGradient(),
      borderRadius: 'inherit',
      zIndex: -1,
      transition: 'filter 0.3s',
    },
    
    ...(hover && {
      '&:hover': {
        transform: 'translateY(-3px)', // Slightly deeper, more noticeable lift
        boxShadow: hoverShadow,
        // Remove default MUI hover background
        backgroundColor: 'transparent !important', 
        
        '&::before': {
          filter: 'brightness(1.15)', // More vibrant gradient on hover
        },
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: 'none',
        '&::before': {
          filter: 'brightness(0.9)', // Dim slightly on click
        },
      },
    }),
    ...sx
  };

  // --- Contained Variant ---
  if (variant === 'contained') {
    return (
      <Button
        variant="contained"
        sx={{
          ...baseStyles,
          // Set color to white for better contrast over the gradient in both modes
          color: 'white', 
          border: 'none',
          // Override MUI's contained button background, relying on ::before
          background: 'transparent !important', 
          
          // Reapply primary color shadow for the initial state
          boxShadow: isDark 
            ? `0 5px 15px ${alpha(theme.palette.common.black, 0.4)}`
            : `0 5px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
          
          '&:hover': {
            ...baseStyles['&:hover'],
            // Important: keep background transparent so ::before can shine
            background: 'transparent', 
          },
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }

  // --- Outlined Variant (Gradient Border) ---
  if (variant === 'outlined') {
    return (
      <Button
        variant="outlined"
        sx={{
          ...baseStyles,
          background: 'transparent',
          
          // CRITICAL: Ensure text color adapts to dark theme
          color: isDark ? theme.palette.text.primary : theme.palette.primary.main, 
          
          // Hide the MUI border entirely to use the gradient effect
          border: `2px solid transparent`,
          
          // These three lines create the gradient border effect
          backgroundClip: 'padding-box',
          '&::before': {
            ...baseStyles['&::before'],
            padding: '2px', // Width of the border
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            // No shadow/filter needed on the ::before for the outlined state
            filter: 'none', 
          },
          
          '&:hover': {
            ...baseStyles['&:hover'],
            // Subtly fill the background with a transparent tint of the gradient's main color
            background: `${alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08)}`,
            borderColor: 'transparent',
            // No boxShadow on hover for outlined buttons unless explicitly desired
            boxShadow: 'none',
          },
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }

  // --- Text Variant ---
  if (variant === 'text') {
    return (
      <Button
        variant="text"
        sx={{
          ...baseStyles,
          color: isDark ? theme.palette.secondary.main : theme.palette.primary.main,
          // Use the ::before as a subtle background hover effect
          background: 'transparent !important',
          
          '&::before': {
            ...baseStyles['&::before'],
            // Make the background element initially transparent
            opacity: 0,
            background: getGradient(),
            transition: 'opacity 0.3s, filter 0.3s',
          },
          
          '&:hover': {
            ...baseStyles['&:hover'],
            transform: 'none', // Remove the vertical lift for a text button
            boxShadow: 'none',
            '&::before': {
              filter: 'brightness(1.1)',
              opacity: isDark ? 0.08 : 0.15, // Subtle opacity on hover
            },
          },
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      sx={baseStyles}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton;