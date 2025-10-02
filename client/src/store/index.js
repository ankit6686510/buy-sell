import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import listingReducer from './slices/listingSlice';
import messageReducer from './slices/messageSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingReducer,
    messages: messageReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 