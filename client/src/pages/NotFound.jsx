import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'; // Added icon

const NotFound = () => {
    const theme = useTheme();

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Use theme-spacing for height calculation
                    minHeight: { xs: 'calc(100vh - 120px)', md: '80vh' },
                    textAlign: 'center',
                    p: 3,
                }}
            >
                {/* Visual Accent for 404 number */}
                <Typography 
                    variant="h1" 
                    component="h1" 
                    color="primary" 
                    sx={{ 
                        fontSize: { xs: '6rem', sm: '10rem', md: '12rem' }, 
                        fontWeight: 900,
                        mb: 2,
                        // 👈 DARK MODE FIX: Subtle shadow effect
                        textShadow: `4px 4px 0 ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300]}`,
                    }}
                >
                    404
                </Typography>
                
                <SentimentDissatisfiedIcon color="action" sx={{ fontSize: 40, mb: 2 }} />

                <Typography variant="h4" component="p" sx={{ mb: 1, fontWeight: 600 }}>
                    Oops! Page Not Found
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </Typography>

                <Button 
                    variant="contained" 
                    color="primary" 
                    component={RouterLink} 
                    to="/" 
                    size="large"
                    sx={{ py: 1.5, px: 4, borderRadius: 2 }}
                >
                    Go to Homepage
                </Button>
            </Box>
        </Container>
    );
};

export default NotFound;