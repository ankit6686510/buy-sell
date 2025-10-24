import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Chip,
    Typography,
    Slider,
    Button,
    Collapse,
    IconButton,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
    Autocomplete,
    FormControl,
    Select,
    MenuItem,
    OutlinedInput,
    useTheme, // 👈 Import useTheme
    alpha, // 👈 Import alpha
} from '@mui/material';
import {
    Search,
    Clear,
    Tune,
    ViewModule,
    ViewList,
    LocationOn,
    DateRange,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Existing Constants (kept for reference)
const brandOptions = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'HP', 'Dell', 'Canon', 'LG', 'Xiaomi', 'OnePlus', 'Realme'];

const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'home_garden', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'books_media', label: 'Books & Media' },
    { value: 'toys_games', label: 'Toys & Games' },
    { value: 'health_beauty', label: 'Health & Beauty' },
    { value: 'others', label: 'Others' }
];

const locationOptions = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad'
];

const conditionOptions = [
    { value: 'new', label: 'New', color: '#22c55e' },
    { value: 'like_new', label: 'Like New', color: '#16a34a' },
    { value: 'good', label: 'Good', color: '#3b82f6' },
    { value: 'fair', label: 'Fair', color: '#f59e0b' },
    { value: 'poor', label: 'Poor', color: '#ef4444' },
];

const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'featured', label: 'Featured' },
];


const ModernFilter = ({ 
    filters, 
    onFiltersChange, 
    onSearch,
    onSort,
    onViewChange,
    viewMode = 'grid',
    resultsCount = 0,
    // isLoading is unused but kept for completeness
}) => {
    const theme = useTheme(); // 👈 Access the theme object
    const isDarkMode = theme.palette.mode === 'dark'; // 👈 Check for dark mode

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 50000]);
    const [selectedCategories, setSelectedCategories] = useState(filters.categories || []);
    const [startDate, setStartDate] = useState(filters.startDate ? new Date(filters.startDate) : null);
    const [endDate, setEndDate] = useState(filters.endDate ? new Date(filters.endDate) : null);
    const [selectedLocation, setSelectedLocation] = useState(filters.location || '');

    // 🌟 THEME-AWARE INPUT STYLING 🌟
    const getFieldStyle = (isSearch = false) => ({
        // Uniform border radius
        '& .MuiOutlinedInput-root': {
            borderRadius: isSearch ? '16px' : '12px',
            transition: 'background-color 0.3s, box-shadow 0.3s',
            // Base background for fields
            backgroundColor: isDarkMode 
                ? alpha(theme.palette.background.paper, isSearch ? 0.7 : 0.4)
                : alpha(theme.palette.background.default, isSearch ? 0.9 : 0.7),
            
            // Border color for inactive state
            '& fieldset': {
                borderColor: isDarkMode ? alpha(theme.palette.grey[700], 0.5) : alpha(theme.palette.grey[400], 0.7),
            },
            // Hover state
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
            },
            // Focus state
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
        },
        // Label color
        '& .MuiInputLabel-root': {
            color: isDarkMode ? theme.palette.grey[300] : theme.palette.text.secondary,
        },
    });


    // --- State and URL Synchronization Logic (Keep as is) ---
    
    // Load filters from URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        
        const urlFilters = {
            search: params.get('search') || '',
            categories: params.get('categories') ? params.get('categories').split(',') : [],
            condition: params.get('condition') ? params.get('condition').split(',') : [],
            minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : 0,
            maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : 50000,
            location: params.get('location') || '',
            startDate: params.get('startDate') || null,
            endDate: params.get('endDate') || null,
            brand: params.get('brand') || '',
            sortBy: params.get('sortBy') || 'newest'
        };

        setSearchValue(urlFilters.search);
        setSelectedCategories(urlFilters.categories);
        setPriceRange([urlFilters.minPrice, urlFilters.maxPrice]);
        setSelectedLocation(urlFilters.location);
        setStartDate(urlFilters.startDate ? new Date(urlFilters.startDate) : null);
        setEndDate(urlFilters.endDate ? new Date(urlFilters.endDate) : null);

        if (Object.values(urlFilters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))) {
            onFiltersChange(urlFilters);
        }
    }, []);

    // Update URL when filters change
    const updateURL = (newFilters) => {
        const params = new URLSearchParams();
        
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && (Array.isArray(value) ? value.length > 0 : true)) {
                if (Array.isArray(value)) {
                    params.set(key, value.join(','));
                } else {
                    params.set(key, value.toString());
                }
            }
        });

        const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newURL);
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchValue(value);
        onSearch(value);
    };

    const handleConditionToggle = (condition) => {
        const currentConditions = filters.condition || [];
        const newConditions = currentConditions.includes(condition)
            ? currentConditions.filter(c => c !== condition)
            : [...currentConditions, condition];
        
        const newFilters = { ...filters, condition: newConditions };
        onFiltersChange(newFilters);
        updateURL(newFilters);
    };

    const handleCategoryChange = (event) => {
        const value = event.target.value;
        const newCategories = typeof value === 'string' ? value.split(',') : value;
        setSelectedCategories(newCategories);
        
        const newFilters = { ...filters, categories: newCategories };
        onFiltersChange(newFilters);
        updateURL(newFilters);
    };

    const handleLocationChange = (event, newValue) => {
        setSelectedLocation(newValue || '');
        const newFilters = { ...filters, location: newValue || '' };
        onFiltersChange(newFilters);
        updateURL(newFilters);
    };

    const handleDateChange = (type, date) => {
        if (type === 'start') {
            setStartDate(date);
            const newFilters = { ...filters, startDate: date ? date.toISOString() : null };
            onFiltersChange(newFilters);
            updateURL(newFilters);
        } else {
            setEndDate(date);
            const newFilters = { ...filters, endDate: date ? date.toISOString() : null };
            onFiltersChange(newFilters);
            updateURL(newFilters);
        }
    };

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
        const newFilters = { 
            ...filters, 
            minPrice: newValue[0], 
            maxPrice: newValue[1] 
        };
        onFiltersChange(newFilters);
        updateURL(newFilters);
    };

    const handleClearFilters = () => {
        setSearchValue('');
        setPriceRange([0, 50000]);
        setSelectedCategories([]);
        setSelectedLocation('');
        setStartDate(null);
        setEndDate(null);
        
        const clearedFilters = {};
        onFiltersChange(clearedFilters);
        onSearch('');
        
        // Clear URL
        window.history.replaceState({}, '', window.location.pathname);
    };

    const activeFiltersCount = Object.values(filters).filter(v => 
        v && (Array.isArray(v) ? v.length > 0 : true)
    ).length;
    
    // --- Render Component ---

    // Primary gradient theme colors
    const primaryGradient = theme.palette.primary.main;
    const secondaryGradient = theme.palette.primary.dark;
    const gradient = `linear-gradient(135deg, ${primaryGradient} 0%, ${secondaryGradient} 100%)`;


    return (
        <Box
            sx={{
                // 🌟 MODERN GLASSMORPHISM STYLE 🌟
                background: isDarkMode 
                    ? alpha(theme.palette.background.paper, 0.85) 
                    : alpha(theme.palette.background.default, 0.8),
                backdropFilter: 'blur(15px)',
                border: `1px solid ${isDarkMode ? alpha(theme.palette.grey[700], 0.3) : alpha(theme.palette.grey[300], 0.5)}`,
                boxShadow: theme.shadows[5],
                borderRadius: '24px',
                p: 3,
                mb: 4,
            }}
        >
            {/* Header & Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.primary.light : theme.palette.text.primary }}
                    >
                        Find Products
                    </Typography>
                    {resultsCount > 0 && (
                        <Chip 
                            label={`${resultsCount} results`}
                            sx={{
                                background: gradient,
                                color: 'white',
                                fontWeight: 600,
                            }}
                        />
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* View Toggle */}
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, value) => value && onViewChange(value)}
                        size="small"
                        sx={{
                            background: isDarkMode ? theme.palette.action.hover : theme.palette.grey[100],
                            borderRadius: '12px',
                            '& .MuiToggleButton-root': {
                                border: 'none',
                                borderRadius: '12px',
                                color: theme.palette.text.secondary,
                                '&.Mui-selected': {
                                    background: gradient,
                                    color: 'white',
                                    '&:hover': {
                                        background: gradient,
                                    }
                                },
                            },
                        }}
                    >
                        <ToggleButton value="grid">
                            <ViewModule />
                        </ToggleButton>
                        <ToggleButton value="list">
                            <ViewList />
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {/* Advanced Filters Toggle */}
                    <IconButton
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        sx={{
                            background: showAdvanced 
                                ? gradient 
                                : isDarkMode ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.5),
                            color: showAdvanced ? 'white' : theme.palette.primary.main,
                            '&:hover': {
                                background: showAdvanced 
                                    ? gradient 
                                    : isDarkMode ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.light, 0.7),
                            },
                        }}
                    >
                        <Tune />
                    </IconButton>

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                        <Button
                            onClick={handleClearFilters}
                            startIcon={<Clear />}
                            variant="outlined"
                            size="small"
                            sx={{
                                borderRadius: '12px',
                                // Use theme-aware error color
                                borderColor: alpha(theme.palette.error.main, 0.5),
                                color: theme.palette.error.main,
                                '&:hover': {
                                    borderColor: theme.palette.error.main,
                                    background: alpha(theme.palette.error.main, 0.1),
                                },
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Search Bar */}
            <TextField
                fullWidth
                placeholder="Search for products, brands, categories..."
                value={searchValue}
                onChange={handleSearchChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search sx={{ color: theme.palette.text.secondary }} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 3,
                    ...getFieldStyle(true), // 👈 Apply Search style
                }}
            />

            {/* Quick Filters */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center', fontWeight: 500 }}>
                    Quick:
                </Typography>
                
                {/* Category Quick Filters */}
                {categoryOptions.slice(0, 4).map((category) => (
                    <Chip
                        key={category.value}
                        label={category.label}
                        onClick={() => {
                            const newCategories = selectedCategories.includes(category.value)
                                ? selectedCategories.filter(c => c !== category.value)
                                : [...selectedCategories, category.value];
                            setSelectedCategories(newCategories);
                            const newFilters = { ...filters, categories: newCategories };
                            onFiltersChange(newFilters);
                            updateURL(newFilters);
                        }}
                        variant={selectedCategories.includes(category.value) ? 'filled' : 'outlined'}
                        sx={{
                            cursor: 'pointer',
                            // Gradient for selected state
                            background: selectedCategories.includes(category.value) 
                                ? gradient
                                : 'transparent',
                            color: selectedCategories.includes(category.value) 
                                ? 'white' 
                                : theme.palette.text.primary,
                            // Theme-aware outline/hover
                            borderColor: selectedCategories.includes(category.value) 
                                ? 'transparent' 
                                : isDarkMode ? alpha(theme.palette.primary.light, 0.3) : alpha(theme.palette.grey[500], 0.5),
                            '&:hover': {
                                background: selectedCategories.includes(category.value) 
                                    ? 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)' 
                                    : isDarkMode ? alpha(theme.palette.primary.dark, 0.1) : alpha(theme.palette.primary.main, 0.1),
                            },
                        }}
                    />
                ))}

                {/* Condition Quick Filters */}
                {conditionOptions.slice(0, 3).map((option) => (
                    <Chip
                        key={option.value}
                        label={option.label}
                        onClick={() => handleConditionToggle(option.value)}
                        variant={filters.condition?.includes(option.value) ? 'filled' : 'outlined'}
                        sx={{
                            cursor: 'pointer',
                            // Use color prop with alpha for soft filled effect
                            background: filters.condition?.includes(option.value) 
                                ? alpha(option.color, isDarkMode ? 0.3 : 0.1)
                                : 'transparent',
                            borderColor: alpha(option.color, isDarkMode ? 0.5 : 0.8),
                            color: filters.condition?.includes(option.value) 
                                ? theme.palette.getContrastText(option.color) // Ensure text contrast
                                : option.color,
                            '&:hover': {
                                background: alpha(option.color, isDarkMode ? 0.4 : 0.2),
                                borderColor: option.color,
                            },
                        }}
                    />
                ))}
            </Box>

            {/* Advanced Filters */}
            <Collapse in={showAdvanced}>
                <Box sx={{ 
                    pt: 3, 
                    mt: 1,
                    // Use theme divider
                    borderTop: `1px solid ${theme.palette.divider}`, 
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Advanced Filters
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        {/* Multi-Select Category Filter */}
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                Categories
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    multiple
                                    value={selectedCategories}
                                    onChange={handleCategoryChange}
                                    input={<OutlinedInput />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const category = categoryOptions.find(c => c.value === value);
                                                return (
                                                    <Chip 
                                                        key={value} 
                                                        label={category?.label || value} 
                                                        size="small"
                                                        sx={{
                                                            background: gradient,
                                                            color: 'white',
                                                            height: '20px',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                    sx={{
                                        ...getFieldStyle(),
                                    }}
                                >
                                    {categoryOptions.map((category) => (
                                        <MenuItem key={category.value} value={category.value}>
                                            {category.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Location Filter */}
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                <LocationOn sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} color="primary" />
                                Location
                            </Typography>
                            <Autocomplete
                                options={locationOptions}
                                value={selectedLocation}
                                onChange={handleLocationChange}
                                freeSolo
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        placeholder="Enter or select location"
                                        size="small"
                                        sx={getFieldStyle()} // 👈 Applied style
                                    />
                                )}
                            />
                        </Box>
                    </Box>

                    {/* Date Range Filter */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                                <DateRange sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} color="primary" />
                                Date Range
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(date) => handleDateChange('start', date)}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            sx: getFieldStyle() // 👈 Applied style
                                        }
                                    }}
                                />
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(date) => handleDateChange('end', date)}
                                    minDate={startDate}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            sx: getFieldStyle() // 👈 Applied style
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </LocalizationProvider>

                    {/* Brand Filter */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            Brand
                        </Typography>
                        <Autocomplete
                            options={brandOptions}
                            value={filters.brand || null}
                            onChange={(event, newValue) => {
                                const newFilters = { ...filters, brand: newValue || '' };
                                onFiltersChange(newFilters);
                                updateURL(newFilters);
                            }}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    placeholder="Select brand"
                                    size="small"
                                    sx={getFieldStyle()} // 👈 Applied style
                                />
                            )}
                        />
                    </Box>

                    {/* Price Range */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                            Price Range: **₹{priceRange[0]}** - **₹{priceRange[1]}**
                        </Typography>
                        <Slider
                            value={priceRange}
                            onChange={handlePriceChange}
                            valueLabelDisplay="auto"
                            min={0}
                            max={50000}
                            step={500}
                            sx={{
                                // Use the same gradient for the slider for consistency
                                color: theme.palette.primary.main,
                                '& .MuiSlider-thumb, & .MuiSlider-track': {
                                    background: gradient,
                                },
                                '& .MuiSlider-rail': {
                                    backgroundColor: isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300],
                                }
                            }}
                        />
                    </Box>

                    {/* All Conditions */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                            Condition
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {conditionOptions.map((option) => (
                                <Chip
                                    key={option.value}
                                    label={option.label}
                                    onClick={() => handleConditionToggle(option.value)}
                                    variant={filters.condition?.includes(option.value) ? 'filled' : 'outlined'}
                                    sx={{
                                        cursor: 'pointer',
                                        // Use color prop with alpha for soft filled effect
                                        background: filters.condition?.includes(option.value) 
                                            ? alpha(option.color, isDarkMode ? 0.3 : 0.1)
                                            : 'transparent',
                                        borderColor: alpha(option.color, isDarkMode ? 0.5 : 0.8),
                                        color: filters.condition?.includes(option.value) 
                                            ? theme.palette.getContrastText(option.color) 
                                            : option.color,
                                        '&:hover': {
                                            background: alpha(option.color, isDarkMode ? 0.4 : 0.2),
                                            borderColor: option.color,
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Sort */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            Sort By
                        </Typography>
                        <Autocomplete
                            options={sortOptions}
                            getOptionLabel={(option) => option.label}
                            value={sortOptions.find(s => s.value === filters.sortBy) || sortOptions[0]}
                            onChange={(event, newValue) => {
                                onSort(newValue?.value);
                                const newFilters = { ...filters, sortBy: newValue?.value };
                                updateURL(newFilters);
                            }}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    placeholder="Sort by"
                                    size="small"
                                    sx={getFieldStyle()} // 👈 Applied style
                                />
                            )}
                        />
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

export default ModernFilter;