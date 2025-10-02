import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listings: [],
  filteredListings: [],
  listing: null,
  userListings: [],
  loading: false,
  error: null,
  filters: {
    brand: '',
    model: '',
    side: '',
    condition: '',
    price: { min: '', max: '' },
    location: '',
  },
};

const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    // Fetch all listings
    fetchListingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchListingsSuccess: (state, action) => {
      // Ensure we always set an array
      state.listings = Array.isArray(action.payload) ? action.payload : action.payload?.listings || [];
      state.loading = false;
    },
    fetchListingsFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Fetch user listings
    fetchUserListingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserListingsSuccess: (state, action) => {
      state.userListings = action.payload;
      state.loading = false;
    },
    fetchUserListingsFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Fetch single listing
    fetchListingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchListingSuccess: (state, action) => {
      state.listing = action.payload;
      state.loading = false;
    },
    fetchListingFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Create listing
    createListingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createListingSuccess: (state, action) => {
      state.listings.push(action.payload);
      state.loading = false;
    },
    createListingFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Update listing
    updateListingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateListingSuccess: (state, action) => {
      const index = state.listings.findIndex(listing => listing._id === action.payload._id);
      if (index !== -1) {
        state.listings[index] = action.payload;
      }
      state.listing = action.payload;
      state.loading = false;
    },
    updateListingFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Delete listing
    deleteListingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteListingSuccess: (state, action) => {
      state.listings = state.listings.filter(listing => listing._id !== action.payload);
      state.loading = false;
    },
    deleteListingFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Favorite listings
    toggleFavoriteStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    toggleFavoriteSuccess: (state, action) => {
      const { listingId, isFavorite } = action.payload;
      // Update the listing's favorite status
      if (state.listing && state.listing._id === listingId) {
        state.listing.isFavorite = isFavorite;
      }
      // Update in the listings array
      const listingIndex = state.listings.findIndex(listing => listing._id === listingId);
      if (listingIndex !== -1) {
        state.listings[listingIndex].isFavorite = isFavorite;
      }
      state.loading = false;
    },
    toggleFavoriteFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    applyFilters: (state) => {
      const filters = state.filters;
      state.filteredListings = state.listings.filter(listing => {
        // Filter by brand
        if (filters.brand && !listing.brand.toLowerCase().includes(filters.brand.toLowerCase())) {
          return false;
        }
        
        // Filter by model
        if (filters.model && !listing.model.toLowerCase().includes(filters.model.toLowerCase())) {
          return false;
        }
        
        // Filter by side
        if (filters.side && listing.side !== filters.side) {
          return false;
        }
        
        // Filter by condition
        if (filters.condition && listing.condition !== filters.condition) {
          return false;
        }
        
        // Filter by price range
        if (filters.price.min && listing.price < Number(filters.price.min)) {
          return false;
        }
        if (filters.price.max && listing.price > Number(filters.price.max)) {
          return false;
        }
        
        // Filter by location
        if (filters.location && !listing.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredListings = [];
    },
    
    // Clear state
    clearListingState: (state) => {
      state.listing = null;
      state.error = null;
    },
  },
});

export const {
  fetchListingsStart,
  fetchListingsSuccess,
  fetchListingsFailure,
  fetchUserListingsStart,
  fetchUserListingsSuccess,
  fetchUserListingsFailure,
  fetchListingStart,
  fetchListingSuccess,
  fetchListingFailure,
  createListingStart,
  createListingSuccess,
  createListingFailure,
  updateListingStart,
  updateListingSuccess,
  updateListingFailure,
  deleteListingStart,
  deleteListingSuccess,
  deleteListingFailure,
  toggleFavoriteStart,
  toggleFavoriteSuccess,
  toggleFavoriteFailure,
  setFilters,
  applyFilters,
  clearFilters,
  clearListingState,
} = listingSlice.actions;

export default listingSlice.reducer;
