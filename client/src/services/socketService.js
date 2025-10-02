import { io } from 'socket.io-client';
import { receiveNewMessage } from '../store/slices/messageSlice';

let socket;
let dispatch;

export const initializeSocket = (userId, storeDispatch) => {
  // Clean up any existing socket first
  disconnectSocket();
  
  dispatch = storeDispatch;
  
  const SOCKET_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
  
  try {
    // Create socket connection
    socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      timeout: 20000
    });
    
    // Socket event listeners
    socket.on('connect', () => {
      console.log('Socket connected');
      // Join user's room for private messages
      socket.emit('join', userId);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    socket.on('newMessage', (message) => {
      // Dispatch action to store new message in Redux
      if (dispatch && message) {
        dispatch(receiveNewMessage(message));
      }
    });
    
    socket.on('new-message', (message) => {
      // Handle both event names for compatibility
      if (dispatch && message) {
        dispatch(receiveNewMessage(message));
      }
    });
    
    socket.on('typing', ({ userId: typingUserId, isTyping }) => {
      // Handle typing indicators
      console.log(`User ${typingUserId} is ${isTyping ? 'typing' : 'stopped typing'}`);
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      // Rejoin user room after reconnection
      socket.emit('join', userId);
    });
    
    return socket;
  } catch (error) {
    console.error('Socket initialization error:', error);
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    socket = null;
  }
};

export const sendPrivateMessage = ({ chatId, message, senderId, receiverId }) => {
  if (socket && socket.connected) {
    socket.emit('private-message', { 
      chatId, 
      message, 
      senderId, 
      receiverId 
    });
  } else {
    console.error('Socket not connected');
  }
};

export const sendTypingStatus = (to, isTyping) => {
  if (socket && socket.connected) {
    socket.emit('typing', { to, isTyping });
  }
};

export const joinChat = (chatId) => {
  if (socket && socket.connected) {
    socket.emit('join-chat', chatId);
  }
};

export const leaveChat = (chatId) => {
  if (socket && socket.connected) {
    socket.emit('leave-chat', chatId);
  }
};

export const getSocket = () => socket;

export const isSocketConnected = () => socket && socket.connected;
