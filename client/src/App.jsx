import { useEffect, useState, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  Box,
  createTheme,
} from '@mui/material';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import EditListing from './pages/EditListing';
import Listings from './pages/Listings';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import PasswordReset from './pages/PasswordReset';
import { checkAuth } from './services/authService';
import { login, logout } from './store/slices/authSlice';
import { getAppTheme } from './theme'; // 🌟 THIS IS THE CORRECTED LINE

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  // 🌙 Manage theme mode
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
    }),
    []
  );

  const theme = useMemo(() => createTheme(getAppTheme(mode)), [mode]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await checkAuth();
        if (userData && userData.user) {
          dispatch(login({ user: userData.user }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        dispatch(logout());
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user && !isInitializing) {
      import('./services/socketService').then(({ initializeSocket }) => {
        initializeSocket(user._id, dispatch);
      });

      return () => {
        import('./services/socketService').then(({ disconnectSocket }) => {
          disconnectSocket();
        });
      };
    }
  }, [isAuthenticated, user, dispatch, isInitializing]);

  if (isInitializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <Header colorMode={colorMode} mode={mode} />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
            />
            <Route path="/forgot-password" element={<PasswordReset />} />
            <Route path="/reset-password/:token" element={<PasswordReset />} />

            {/* Listings */}
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />

            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/listings/create"
              element={
                <ProtectedRoute>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-listing"
              element={<Navigate to="/listings/create" replace />}
            />
            <Route
              path="/listings/edit/:id"
              element={
                <ProtectedRoute>
                  <EditListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:chatId"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {location.pathname === '/' && <Footer />}
      </div>
    </ThemeProvider>
  );
};

export default App;