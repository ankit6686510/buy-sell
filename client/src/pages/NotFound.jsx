import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '70vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" color="primary" sx={{ fontSize: '10rem', fontWeight: 700 }}>
          404
        </Typography>

        <Typography variant="h4" component="p" sx={{ mb: 4 }}>
          Oops! Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </Typography>

        <Button variant="contained" color="primary" component={RouterLink} to="/" size="large">
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 