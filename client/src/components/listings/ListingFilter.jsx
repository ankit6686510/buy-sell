import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { setFilters, applyFilters, clearFilters } from '../../store/slices/listingSlice';

const ListingFilter = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.listings);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expanded, setExpanded] = useState(!isMobile);
  const [localFilters, setLocalFilters] = useState(filters);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value,
    });
  };
  
  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    dispatch(applyFilters());
    if (isMobile) {
      setExpanded(false);
    }
  };
  
  const handleClearFilters = () => {
    dispatch(clearFilters());
    setLocalFilters({
      brand: '',
      model: '',
      side: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      location: '',
    });
  };
  
  return (
    <Accordion 
      expanded={expanded} 
      onChange={() => setExpanded(!expanded)}
      elevation={1}
      sx={{ mb: 3 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="filter-content"
        id="filter-header"
      >
        <Typography variant="h6">Filter Earbuds</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box component="form">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="brand"
                label="Brand"
                variant="outlined"
                fullWidth
                value={localFilters.brand}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="model"
                label="Model"
                variant="outlined"
                fullWidth
                value={localFilters.model}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Side</InputLabel>
                <Select
                  name="side"
                  label="Side"
                  value={localFilters.side}
                  onChange={handleChange}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  name="condition"
                  label="Condition"
                  value={localFilters.condition}
                  onChange={handleChange}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="like_new">Like New</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                name="minPrice"
                label="Min Price"
                type="number"
                variant="outlined"
                fullWidth
                value={localFilters.minPrice}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                name="maxPrice"
                label="Max Price"
                type="number"
                variant="outlined"
                fullWidth
                value={localFilters.maxPrice}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="location"
                label="Location"
                variant="outlined"
                fullWidth
                value={localFilters.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ListingFilter; 