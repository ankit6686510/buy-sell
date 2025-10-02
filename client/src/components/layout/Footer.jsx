import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  Stack,
  Divider,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  Phone,
  LocationOn,
  Send,
  Security,
  Verified,
  ArrowUpward
} from '@mui/icons-material';

import GradientButton from '../modern/GradientButton';
import GlassCard from '../modern/GlassCard';
import { gradients, animations } from '../../theme';

const Footer = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      // Here you would typically send the email to your backend
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: Facebook, url: '#', color: '#1877f2' },
    { icon: Twitter, url: '#', color: '#1da1f2' },
    { icon: Instagram, url: '#', color: '#e4405f' },
    { icon: LinkedIn, url: '#', color: '#0077b5' },
    { icon: YouTube, url: '#', color: '#ff0000' },
  ];

  const stats = [
    { value: '15K+', label: 'Matches' },
    { value: '94%', label: 'Success Rate' },
    { value: '4.9★', label: 'Rating' },
  ];

  const footerSections = [
    {
      title: 'Product',
      links: [
        { text: 'How It Works', href: '/how-it-works' },
        { text: 'Browse Listings', href: '/listings' },
        { text: 'Create Listing', href: '/create-listing' },
        { text: 'Success Stories', href: '/success-stories' },
        { text: 'Pricing', href: '/pricing' },
      ],
    },
    {
      title: 'Support',
      links: [
        { text: 'Help Center', href: '/help' },
        { text: 'Contact Support', href: '/contact' },
        { text: 'Community Guidelines', href: '/guidelines' },
        { text: 'Safety Tips', href: '/safety' },
        { text: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About Us', href: '/about' },
        { text: 'Careers', href: '/careers' },
        { text: 'Press Kit', href: '/press' },
        { text: 'Blog', href: '/blog' },
        { text: 'Investors', href: '/investors' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { text: 'Privacy Policy', href: '/privacy' },
        { text: 'Terms of Service', href: '/terms' },
        { text: 'Cookie Policy', href: '/cookies' },
        { text: 'Legal Notice', href: '/legal' },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        position: 'relative',
        mt: 8,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, ${alpha(theme.palette.secondary.main, 0.2)} 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Newsletter Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ py: 6 }}>
          <GlassCard
            sx={{
              p: 4,
              textAlign: 'center',
              background: alpha(theme.palette.background.paper, 0.1),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: gradients.secondary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 2,
              }}
            >
              Stay Connected
            </Typography>
            <Typography variant="h6" color="rgba(255, 255, 255, 0.8)" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Get the latest updates on new matches, platform features, and success stories delivered to your inbox.
            </Typography>
            
            <Box
              component="form"
              onSubmit={handleNewsletterSubmit}
              sx={{
                display: 'flex',
                gap: 2,
                maxWidth: 400,
                mx: 'auto',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <TextField
                fullWidth
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    },
                  },
                }}
              />
              <GradientButton
                type="submit"
                endIcon={<Send />}
                sx={{
                  px: 4,
                  py: 1.5,
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                }}
              >
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
              </GradientButton>
            </Box>
          </GlassCard>
        </Box>

        {/* Main Footer Content */}
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* Brand Section */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: gradients.secondary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 2,
                  }}
                >
                  BudMatching
                </Typography>
                <Typography variant="body1" color="rgba(255, 255, 255, 0.8)" sx={{ mb: 3, lineHeight: 1.6 }}>
                  The world's first smart platform for finding matching earbuds. Connect with verified users, trade safely, and get your earbuds working again.
                </Typography>
                
                {/* Stats */}
                <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
                  {stats.map((stat, index) => (
                    <Box key={index} sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: gradients.secondary,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                {/* Contact Info */}
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Email sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                      support@SecondMarket.com
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Phone sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                      +1 (555) 123-4567
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                      San Francisco, CA, USA
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Footer Links */}
            <Grid item xs={12} lg={8}>
              <Grid container spacing={4}>
                {footerSections.map((section, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 3,
                        color: 'white',
                      }}
                    >
                      {section.title}
                    </Typography>
                    <Stack spacing={2}>
                      {section.links.map((link, linkIndex) => (
                        <Link
                          key={linkIndex}
                          href={link.href}
                          color="rgba(255, 255, 255, 0.8)"
                          sx={{
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: 'white',
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          {link.text}
                        </Link>
                      ))}
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), my: 4 }} />

        {/* Bottom Section */}
        <Box sx={{ py: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                © 2025 BudMatching, Inc. All rights reserved.
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1 }}>
                Made with ❤️ for the global earbud community
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, alignItems: 'center', gap: 2 }}>
                {/* Security Badges */}
                <Chip
                  icon={<Security />}
                  label="SSL Secured"
                  variant="outlined"
                  size="small"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '& .MuiChip-icon': { color: '#4caf50' },
                  }}
                />
                <Chip
                  icon={<Verified />}
                  label="Verified Platform"
                  variant="outlined"
                  size="small"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '& .MuiChip-icon': { color: '#ff9800' },
                  }}
                />
                
                {/* Social Media Links */}
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  {socialLinks.map((social, index) => (
                    <IconButton
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: social.color,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <social.icon />
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Back to Top Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={scrollToTop}
          sx={{
            background: gradients.primary,
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
            },
          }}
        >
          <ArrowUpward />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Footer;
