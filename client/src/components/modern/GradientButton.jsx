import React from 'react';
import { Button, useTheme } from '@mui/material';
import { gradients } from '../../theme';

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

  const baseStyles = {
    borderRadius: 2,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
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
    },
    ...(hover && {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px ${theme.palette.primary.main}40`,
        '&::before': {
          filter: 'brightness(1.1)',
        },
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    }),
    ...sx
  };

  if (variant === 'contained') {
    return (
      <Button
        variant="contained"
        sx={{
          ...baseStyles,
          background: getGradient(),
          color: 'white',
          border: 'none',
          '&:hover': {
            ...baseStyles['&:hover'],
            background: getGradient(),
          },
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }

  if (variant === 'outlined') {
    return (
      <Button
        variant="outlined"
        sx={{
          ...baseStyles,
          background: 'transparent',
          border: `2px solid transparent`,
          backgroundClip: 'padding-box',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: getGradient(),
            borderRadius: 'inherit',
            padding: '2px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            zIndex: -1,
          },
          color: 'primary.main',
          '&:hover': {
            ...baseStyles['&:hover'],
            background: `${getGradient()}15`,
            borderColor: 'transparent',
          },
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }

  if (variant === 'text') {
    return (
      <Button
        variant="text"
        sx={{
          ...baseStyles,
          background: `${getGradient()}10`,
          color: 'primary.main',
          '&:hover': {
            ...baseStyles['&:hover'],
            background: `${getGradient()}20`,
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
