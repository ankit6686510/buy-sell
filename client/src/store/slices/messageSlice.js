import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  messages: [],
  activeChatId: null,
  loading: false,
  error: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Fetch all chats
    fetchChatsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchChatsSuccess: (state, action) => {
      state.chats = action.payload;
      state.loading = false;
    },
    fetchChatsFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Fetch messages for a specific chat
    fetchMessagesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action) => {
      state.messages = action.payload;
      state.loading = false;
    },
    fetchMessagesFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Send a message
    sendMessageStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    sendMessageSuccess: (state, action) => {
      state.messages.push(action.payload);
      
      // Update the last message in the chats list
      const chatIndex = state.chats.findIndex(
        (chat) => chat._id === state.activeChatId
      );
      
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = {
          content: action.payload.content,
          sender: action.payload.sender._id,
          createdAt: action.payload.createdAt
        };
      }
      
      state.loading = false;
    },
    sendMessageFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Add a new chat
    addChatSuccess: (state, action) => {
      // Check if chat already exists
      const existingChatIndex = state.chats.findIndex(
        (chat) => chat._id === action.payload._id
      );
      
      if (existingChatIndex === -1) {
        state.chats.unshift(action.payload);
      }
      
      state.activeChatId = action.payload._id;
    },
    
    // Mark messages as read
    markMessagesAsRead: (state, action) => {
      const { chatId } = action.payload;
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      
      if (chatIndex !== -1) {
        state.chats[chatIndex].unreadCount = 0;
      }
    },
    
    // Set active chat
    setActiveChatId: (state, action) => {
      state.activeChatId = action.payload;
      
      // Mark messages as read when chat becomes active
      if (action.payload) {
        const chatIndex = state.chats.findIndex((chat) => chat._id === action.payload);
        if (chatIndex !== -1) {
          state.chats[chatIndex].unreadCount = 0;
        }
      }
    },
    
    // Update unread count when receiving a new message
    receiveMessage: (state, action) => {
      const { message, chatId } = action.payload;
      
      // Add message to current chat if it's active
      if (state.activeChatId === chatId) {
        state.messages.push(message);
      } else {
        // Update unread count for chat
        const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
        
        if (chatIndex !== -1) {
          state.chats[chatIndex].unreadCount = (state.chats[chatIndex].unreadCount || 0) + 1;
          state.chats[chatIndex].lastMessage = {
            content: message.content,
            sender: message.sender._id,
            createdAt: message.createdAt
          };
          
          // Move chat to top of list
          const chat = state.chats[chatIndex];
          state.chats.splice(chatIndex, 1);
          state.chats.unshift(chat);
        }
      }
    },
    
    // Clear messages state
    clearMessageState: (state) => {
      state.messages = [];
      state.activeChatId = null;
      state.error = null;
    },
  },
});

export const {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  addChatSuccess,
  markMessagesAsRead,
  setActiveChatId,
  receiveMessage: receiveNewMessage,
  clearMessageState,
} = messageSlice.actions;

export default messageSlice.reducer; 