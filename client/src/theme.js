import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// ---------- Color palette ----------
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

// ---------- Light theme ----------
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
    h1: { fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1 },
    h2: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h3: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.7, color: colors.neutral[700] },
    body2: { fontSize: '0.875rem', lineHeight: 1.6, color: colors.neutral[600] },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 16 },
});

// ---------- Dark theme ----------
const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    ...lightTheme.palette,
    mode: 'dark',
    background: {
      default: colors.neutral[900],
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
});

// ---------- Responsive versions ----------
export const lightResponsiveTheme = responsiveFontSizes(lightTheme);
export const darkResponsiveTheme = responsiveFontSizes(darkTheme);

// ---------- Glassmorphism utility ----------
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

// ---------- Animations ----------
export const animations = {
  float: 'float 6s ease-in-out infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  slideInUp: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  fadeIn: 'fadeIn 0.6s ease-in-out',
};

// ---------- Gradients ----------
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`,
  success: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
  rainbow: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 50%, ${colors.success[500]} 100%)`,
  sunset: `linear-gradient(135deg, #ff6b6b 0%, #ffa726 50%, #ffeb3b 100%)`,
  ocean: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
};

// ---------- Dark mode toggle helper ----------
// These functions are kept, but if you don't use them, you can remove them.
export const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme === 'dark') return darkResponsiveTheme;
    if (savedTheme === 'light') return lightResponsiveTheme;
  }
  // Default to system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? darkResponsiveTheme : lightResponsiveTheme;
};

export const toggleTheme = (currentTheme) => {
  const newTheme = currentTheme.palette.mode === 'light' ? darkResponsiveTheme : lightResponsiveTheme;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('appTheme', newTheme.palette.mode);
  }
  return newTheme;
};

// 🌟 THE FIX: This function is what App.jsx needs 
// to dynamically get the light or dark theme based on the 'mode' string.
export const getAppTheme = (mode) => {
    return mode === 'dark' ? darkResponsiveTheme : lightResponsiveTheme;
};

