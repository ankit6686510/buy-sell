import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Modern color palette with purple/magenta gradient scheme
const colors = {
  primary: {
    50: '#f8f5fc',
    100: '#f1ebf8',
    200: '#e3d6f1',
    300: '#d4c1ea',
    400: '#b898dc',
    500: '#55286F', // Main purple
    600: '#4d2463',
    700: '#451f57',
    800: '#3d1b4b',
    900: '#35173f',
    main: '#55286F',
    light: '#b898dc',
    dark: '#3d1b4b',
  },
  secondary: {
    50: '#fdfafd',
    100: '#faf5fa',
    200: '#f5eaf5',
    300: '#efdef0',
    400: '#e5c7e6',
    500: '#BC96E6', // Light purple
    600: '#a987cf',
    700: '#9678b8',
    800: '#8369a1',
    900: '#705a8a',
    main: '#BC96E6',
    light: '#e5c7e6',
    dark: '#8369a1',
  },
  success: {
    50: '#fdfbfd',
    100: '#fbf7fb',
    200: '#f6eef7',
    300: '#f1e5f2',
    400: '#e8d3ea',
    500: '#D8B4E2', // Light pink-purple
    600: '#c2a3cb',
    700: '#ac92b4',
    800: '#96819d',
    900: '#807086',
    main: '#D8B4E2',
  },
  warning: {
    50: '#fcfafc',
    100: '#f9f5f8',
    200: '#f2eaf2',
    300: '#eadfeb',
    400: '#dbc9dd',
    500: '#AE759F', // Muted purple-pink
    600: '#9d698f',
    700: '#8c5d7f',
    800: '#7b516f',
    900: '#6a455f',
    main: '#AE759F',
  },
  error: {
    50: '#fdf6f8',
    100: '#fbedf1',
    200: '#f7dbe3',
    300: '#f2c8d5',
    400: '#eaa3b9',
    500: '#e07e9d',
    600: '#ca718d',
    700: '#b4647d',
    800: '#9e576d',
    900: '#884a5d',
    main: '#e07e9d',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#210B2C', // Main dark color
  },
  glass: {
    light: 'rgba(85, 40, 111, 0.15)',
    medium: 'rgba(85, 40, 111, 0.25)',
    dark: 'rgba(33, 11, 44, 0.8)',
  }
};

// Create light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
    background: {
      default: '#fafafa',
      paper: '#ffffff',
      glass: colors.glass.light,
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      disabled: colors.neutral[400],
    },
    divider: colors.neutral[200],
    action: {
      hover: colors.neutral[50],
      selected: colors.neutral[100],
      disabled: colors.neutral[300],
    }
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.025em',
      lineHeight: 1.1,
      background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[500]} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      color: colors.neutral[700],
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: colors.neutral[600],
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: colors.neutral[500],
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 35px 60px -12px rgba(0, 0, 0, 0.3)',
    // Glass morphism shadows
    '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    '0 8px 32px 0 rgba(255, 255, 255, 0.18)',
    // Modern card shadows
    'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
    'rgba(0, 0, 0, 0.1) 0px 4px 12px',
    'rgba(0, 0, 0, 0.1) 0px 10px 40px',
    'rgba(0, 0, 0, 0.15) 0px 20px 60px',
    'rgba(0, 0, 0, 0.2) 0px 30px 80px',
    // Elevated shadows
    'rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px',
    'rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px, rgba(17, 17, 26, 0.1) 0px 24px 80px',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`,
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.neutral[300]} transparent`,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.neutral[300],
            borderRadius: '3px',
            '&:hover': {
              background: colors.neutral[400],
            },
          },
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        '@keyframes slideInUp': {
          '0%': { transform: 'translateY(30px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
          boxShadow: '0 4px 15px rgba(85, 40, 111, 0.3)',
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
            boxShadow: '0 8px 25px rgba(85, 40, 111, 0.4)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: colors.neutral[200],
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: colors.primary[300],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        elevation1: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        elevation3: {
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              boxShadow: `0 0 0 3px ${colors.primary[100]}`,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
        },
        colorPrimary: {
          background: `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`,
          color: colors.primary[800],
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: 'none',
          boxShadow: '0 4px 20px rgba(85, 40, 111, 0.3)',
          color: '#ffffff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&.Mui-selected': {
            background: `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primary[200]} 0%, ${colors.primary[300]} 100%)`,
            },
          },
          '&:hover': {
            background: colors.neutral[50],
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '3px solid rgba(255, 255, 255, 0.3)',
          background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.secondary[400]} 100%)`,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
          boxShadow: '0 8px 25px rgba(85, 40, 111, 0.3)',
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 35px rgba(85, 40, 111, 0.4)',
          },
        },
      },
    },
  },
});

// Create dark theme
const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
    background: {
      default: colors.neutral[900], // #210B2C
      paper: colors.glass.dark,
      glass: colors.glass.dark,
    },
    text: {
      primary: colors.neutral[50],
      secondary: colors.neutral[400],
      disabled: colors.neutral[600],
    },
    divider: colors.neutral[800],
    action: {
      hover: colors.neutral[800],
      selected: colors.neutral[700],
      disabled: colors.neutral[600],
    }
  },
  components: {
    ...lightTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        ...lightTheme.components.MuiCssBaseline.styleOverrides,
        body: {
          background: `linear-gradient(135deg, ${colors.neutral[900]} 0%, ${colors.primary[800]} 100%)`,
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.neutral[700]} transparent`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

// Export responsive themes
export const lightResponsiveTheme = responsiveFontSizes(lightTheme);
export const darkResponsiveTheme = responsiveFontSizes(darkTheme);

// Custom CSS utilities
export const glassMorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  dark: {
    background: 'rgba(26, 26, 26, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  },
};

export const animations = {
  float: 'float 6s ease-in-out infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  slideInUp: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  fadeIn: 'fadeIn 0.6s ease-in-out',
};

// Gradient utilities
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`,
  success: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
  rainbow: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 50%, ${colors.success[500]} 100%)`,
  sunset: `linear-gradient(135deg, #ff6b6b 0%, #ffa726 50%, #ffeb3b 100%)`,
  ocean: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
};

// Default export (light theme)
export default lightResponsiveTheme;
