import React from 'react';
import { Card, CardContent, Box, useTheme } from '@mui/material';
import { glassMorphism, animations } from '../../theme';

const GlassCard = ({ 
  children, 
  elevation = 1, 
  hover = true, 
  animation = 'fadeIn', 
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Card
      sx={{
        ...glassMorphism[isDark ? 'dark' : 'light'],
        animation: animations[animation],
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: isDark 
              ? '0 20px 40px rgba(0, 0, 0, 0.5)' 
              : '0 20px 40px rgba(31, 38, 135, 0.4)',
          }
        }),
        ...sx
      }}
      elevation={0}
      {...props}
    >
      {children}
    </Card>
  );
};

export default GlassCard;
