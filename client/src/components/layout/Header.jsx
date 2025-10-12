import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  useTheme,
  alpha,
  Drawer,
  List,
  ListItem,
  Divider,
  useScrollTrigger,
  Slide
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import MessageIcon from '@mui/icons-material/Message';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import ListIcon from '@mui/icons-material/List';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import { logout } from '../../store/slices/authSlice';
import GradientButton from '../modern/GradientButton';
import { gradients } from '../../theme';

function HideOnScroll({ children, window }) {
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <div>{children}</div>
    </Slide>
  );
}

const Header = ({ colorMode, mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { chats } = useSelector((state) => state.messages);
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const unreadCount = Array.isArray(chats) 
    ? chats.reduce((acc, chat) => acc + (chat?.unreadCount || 0), 0)
    : 0;

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    handleCloseUserMenu();
  };

  const publicPages = [
    { title: 'Home', path: '/', icon: HomeIcon },
    { title: 'Listings', path: '/listings', icon: ListIcon },
  ];
  
  const privatePages = [
    { title: 'Create Listing', path: '/create-listing', icon: AddCircleOutlineIcon },
    { title: 'Messages', path: '/messages', icon: MessageIcon, badge: unreadCount },
  ];
  
  const settings = [
    { title: 'Profile', action: () => navigate('/profile'), icon: PersonOutlineIcon },
    { title: 'Logout', action: handleLogout, icon: LogoutIcon },
  ];

  const isActiveLink = (path) => location.pathname === path;

  const NavButton = ({ page, mobile = false }) => (
    <Button
      key={page.title}
      component={RouterLink}
      to={page.path}
      onClick={mobile ? handleDrawerToggle : undefined}
      startIcon={mobile ? <page.icon /> : undefined}
      sx={{
        my: mobile ? 0 : 2,
        mx: mobile ? 0 : 1,
        color: 'white',
        display: 'block',
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: 2,
        px: 3,
        py: 1,
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        justifyContent: mobile ? 'flex-start' : 'center',
        width: mobile ? '100%' : 'auto',
        '&::before': !mobile ? {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: 0,
          height: '2px',
          background: gradients.secondary,
          transition: 'all 0.3s ease',
          transform: 'translateX(-50%)',
        } : {},
        '&:hover': !mobile ? {
          background: alpha(theme.palette.common.white, 0.1),
          transform: 'translateY(-1px)',
          '&::before': { width: '80%' },
        } : {
          background: alpha(theme.palette.common.white, 0.1),
        },
        ...(isActiveLink(page.path) && !mobile && {
          background: alpha(theme.palette.common.white, 0.1),
          '&::before': { width: '80%' },
        }),
      }}
    >
      {page.badge ? (
        <Badge badgeContent={page.badge} color="error" sx={{ mr: 1 }}>
          {page.title}
        </Badge>
      ) : (
        page.title
      )}
    </Button>
  );

  const drawer = (
    <Box sx={{ 
      width: 280,
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      height: '100%',
      color: 'white'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          SecondMarket
        </Typography>
        <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List sx={{ px: 2, py: 3 }}>
        {publicPages.map((page) => (
          <ListItem key={page.title} disablePadding sx={{ mb: 1 }}>
            <NavButton page={page} mobile />
          </ListItem>
        ))}
        
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 2, bgcolor: alpha(theme.palette.common.white, 0.1) }} />
            {privatePages.map((page) => (
              <ListItem key={page.title} disablePadding sx={{ mb: 1 }}>
                <NavButton page={page} mobile />
              </ListItem>
            ))}
          </>
        )}
        
        {!isAuthenticated && (
          <>
            <Divider sx={{ my: 2, bgcolor: alpha(theme.palette.common.white, 0.1) }} />
            <ListItem disablePadding sx={{ mb: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                startIcon={<PersonOutlineIcon />}
                onClick={handleDrawerToggle}
                sx={{
                  color: 'white',
                  justifyContent: 'flex-start',
                  width: '100%',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  '&:hover': {
                    background: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                Login
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <GradientButton
                component={RouterLink}
                to="/register"
                onClick={handleDrawerToggle}
                sx={{ width: '100%', py: 1.5, fontWeight: 600 }}
              >
                Get Started
              </GradientButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <HideOnScroll>
      <AppBar 
        position="fixed" 
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}f0 0%, ${theme.palette.primary.dark}f0 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 70 } }}>
            {/* Logo - large screens */}
            <Box 
              component={RouterLink}
              to="/"
              sx={{
                mr: 4,
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                textDecoration: 'none',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: gradients.secondary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.5px',
                }}
              >
                SecondMarket
              </Typography>
            </Box>

            {/* Mobile menu button */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                onClick={handleDrawerToggle}
                color="inherit"
                sx={{
                  color: 'white',
                  '&:hover': { background: alpha(theme.palette.common.white, 0.1) },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo - mobile */}
            <Box 
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                textDecoration: 'none',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: gradients.secondary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                SecondMarket
              </Typography>
            </Box>

            {/* Desktop menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {publicPages.map((page) => (
                <NavButton key={page.title} page={page} />
              ))}
              {isAuthenticated && privatePages.map((page) => (
                <NavButton key={page.title} page={page} />
              ))}
            </Box>

            {/* 🌙 Dark Mode Toggle */}
            <IconButton
              sx={{
                ml: 1,
                color: 'white',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'rotate(15deg) scale(1.1)',
                  background: alpha(theme.palette.common.white, 0.1),
                },
              }}
              onClick={colorMode.toggleColorMode}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* User menu */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <IconButton
                    size="large"
                    color="inherit"
                    onClick={() => navigate('/messages')}
                    sx={{ 
                      mr: 2, 
                      display: { xs: 'none', md: 'flex' },
                      color: 'white',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: alpha(theme.palette.common.white, 0.1),
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  
                  <Tooltip title="Open profile menu">
                    <IconButton 
                      onClick={handleOpenUserMenu} 
                      sx={{ 
                        p: 0.5,
                        border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`,
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <Avatar 
                        alt={user?.name || 'User'} 
                        src={user?.avatar || ''} 
                        sx={{ 
                          bgcolor: theme.palette.secondary.main,
                          width: 40,
                          height: 40,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                        }}
                      >
                        {user?.name?.charAt(0) || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ 
                      mt: '50px',
                      '& .MuiPaper-root': {
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 3,
                        minWidth: 180,
                      },
                    }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {settings.map((setting) => (
                      <MenuItem 
                        key={setting.title} 
                        onClick={() => {
                          setting.action();
                          handleCloseUserMenu();
                        }}
                        sx={{
                          py: 1.5,
                          px: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <setting.icon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography>{setting.title}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    color="inherit"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: alpha(theme.palette.common.white, 0.1),
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Login
                  </Button>
                  <GradientButton
                    component={RouterLink}
                    to="/register"
                    sx={{
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    Get Started
                  </GradientButton>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, border: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Toolbar spacer */}
      <Toolbar sx={{ minHeight: { xs: 64, md: 70 } }} />
    </HideOnScroll>
  );
};

export default Header;
