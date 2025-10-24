import { useState, useEffect } from 'react';
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
    alpha, // 👈 Added alpha for theme-aware colors
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList'; // 👈 Added a relevant icon
import { setFilters, applyFilters, clearFilters } from '../../store/slices/listingSlice';

const ListingFilter = () => {
    const dispatch = useDispatch();
    const { filters } = useSelector((state) => state.listings);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isDarkMode = theme.palette.mode === 'dark';
    
    const [expanded, setExpanded] = useState(!isMobile);
    const [localFilters, setLocalFilters] = useState(filters);

    // 👈 IMPORTANT: Use useEffect to keep local state synced with global Redux state
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);
    
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
        // The useEffect hook above will catch the Redux clear and update localFilters
    };

    // 🌟 MODERN INPUT STYLING 🌟
    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2, // Slightly more rounded
            // Subtle, theme-aware background for better contrast
            backgroundColor: isDarkMode ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.grey[100], 0.7),
            '& fieldset': {
                borderColor: isDarkMode ? alpha(theme.palette.grey[600], 0.5) : alpha(theme.palette.grey[400], 0.8),
                transition: 'border-color 0.2s',
            },
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px', // Thicker border on focus
            },
        },
        '& .MuiInputLabel-root': {
            color: isDarkMode ? theme.palette.grey[300] : theme.palette.text.secondary,
        }
    };
    
    return (
        <Accordion 
            expanded={expanded} 
            onChange={() => setExpanded(!expanded)}
            elevation={isDarkMode ? 4 : 2} // Higher elevation in dark mode for depth
            sx={{ 
                mb: 3,
                borderRadius: '16px !important', // Enforce large rounded corners
                // Main Accordion background
                background: isDarkMode ? alpha(theme.palette.background.paper, 0.9) : theme.palette.background.paper,
                border: `1px solid ${isDarkMode ? alpha(theme.palette.grey[700], 0.5) : alpha(theme.palette.grey[300], 0.8)}`,
                transition: 'box-shadow 0.3s',
                '&:hover': {
                    boxShadow: isDarkMode 
                        ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}` 
                        : `0 4px 10px ${alpha(theme.palette.primary.main, 0.1)}`,
                }
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                aria-controls="filter-content"
                id="filter-header"
                sx={{ 
                    color: theme.palette.text.primary, 
                    borderBottom: expanded ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.5),
                    }
                }}
            >
                <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Filter Listings
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box component="form">
                    <Grid container spacing={2}>
                        
                        {/* Filter Fields using the defined inputStyle */}
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                name="brand"
                                label="Brand"
                                variant="outlined"
                                fullWidth
                                value={localFilters.brand}
                                onChange={handleChange}
                                sx={inputStyle} // 👈 Applied style
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
                                sx={inputStyle} // 👈 Applied style
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth sx={inputStyle}>
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
                            <FormControl fullWidth sx={inputStyle}>
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
                                sx={inputStyle} // 👈 Applied style
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
                                sx={inputStyle} // 👈 Applied style
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
                                sx={inputStyle} // 👈 Applied style
                            />
                        </Grid>
                        
                        {/* Action Buttons */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    onClick={handleClearFilters}
                                    // Subtle outline button style
                                    sx={{
                                        borderRadius: 2,
                                        borderColor: isDarkMode ? alpha(theme.palette.primary.main, 0.5) : theme.palette.primary.light,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                            borderColor: theme.palette.primary.main,
                                        }
                                    }}
                                >
                                    Clear Filters
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={handleApplyFilters}
                                    // Solid, prominent button style
                                    sx={{ 
                                        borderRadius: 2, 
                                        fontWeight: 600,
                                        boxShadow: theme.shadows[4],
                                        '&:hover': {
                                            boxShadow: theme.shadows[6],
                                        }
                                    }}
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