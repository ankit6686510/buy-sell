import { useState } from 'react';
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
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Tune,
  ViewModule,
  ViewList,
  Sort,
} from '@mui/icons-material';

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
  isLoading = false 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 50000]);

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
    
    onFiltersChange({ ...filters, condition: newConditions });
  };

  const handleCategoryToggle = (category) => {
    onFiltersChange({ 
      ...filters, 
      category: filters.category === category ? '' : category 
    });
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
    onFiltersChange({ 
      ...filters, 
      minPrice: newValue[0], 
      maxPrice: newValue[1] 
    });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setPriceRange([0, 50000]);
    onFiltersChange({});
    onSearch('');
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        p: 3,
        mb: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Find Products
          </Typography>
          {resultsCount > 0 && (
            <Chip 
              label={`${resultsCount} results`}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
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
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '12px',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  color: 'white',
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
              background: showAdvanced ? 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' : 'rgba(99, 102, 241, 0.1)',
              color: showAdvanced ? 'white' : '#6366f1',
              '&:hover': {
                background: showAdvanced ? 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)' : 'rgba(99, 102, 241, 0.2)',
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
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                '&:hover': {
                  borderColor: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.1)',
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
              <Search sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.9)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 1)',
            },
          },
        }}
      />

      {/* Quick Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
          Quick filters:
        </Typography>
        
        {/* Category Filters */}
        {categoryOptions.slice(0, 4).map((category) => (
          <Chip
            key={category.value}
            label={category.label}
            onClick={() => handleCategoryToggle(category.value)}
            variant={filters.category === category.value ? 'filled' : 'outlined'}
            sx={{
              background: filters.category === category.value 
                ? 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' 
                : 'transparent',
              color: filters.category === category.value ? 'white' : 'inherit',
              '&:hover': {
                background: filters.category === category.value 
                  ? 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)' 
                  : 'rgba(99, 102, 241, 0.1)',
              },
            }}
          />
        ))}

        {/* Condition Filters */}
        {conditionOptions.slice(0, 3).map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            onClick={() => handleConditionToggle(option.value)}
            variant={filters.condition?.includes(option.value) ? 'filled' : 'outlined'}
            sx={{
              background: filters.condition?.includes(option.value) 
                ? `linear-gradient(135deg, ${option.color}15 0%, ${option.color}25 100%)` 
                : 'transparent',
              borderColor: `${option.color}40`,
              color: filters.condition?.includes(option.value) ? option.color : 'inherit',
              '&:hover': {
                background: `${option.color}15`,
                borderColor: option.color,
              },
            }}
          />
        ))}
      </Box>

      {/* Advanced Filters */}
      <Collapse in={showAdvanced}>
        <Box sx={{ pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Advanced Filters
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Category Filter */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Category
              </Typography>
              <Autocomplete
                options={categoryOptions}
                getOptionLabel={(option) => option.label}
                value={categoryOptions.find(c => c.value === filters.category) || null}
                onChange={(event, newValue) => 
                  onFiltersChange({ ...filters, category: newValue?.value || '' })
                }
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Select category"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                )}
              />
            </Box>

            {/* Brand Filter */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Brand
              </Typography>
              <Autocomplete
                options={brandOptions}
                value={filters.brand || null}
                onChange={(event, newValue) => 
                  onFiltersChange({ ...filters, brand: newValue })
                }
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Select brand"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Price Range */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
              Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={50000}
              step={500}
              sx={{
                color: '#6366f1',
                '& .MuiSlider-thumb': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                },
                '& .MuiSlider-track': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                },
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
                    background: filters.condition?.includes(option.value) 
                      ? `linear-gradient(135deg, ${option.color}15 0%, ${option.color}25 100%)` 
                      : 'transparent',
                    borderColor: `${option.color}40`,
                    color: filters.condition?.includes(option.value) ? option.color : 'inherit',
                    '&:hover': {
                      background: `${option.color}15`,
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
              onChange={(event, newValue) => onSort(newValue?.value)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Sort by"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
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
