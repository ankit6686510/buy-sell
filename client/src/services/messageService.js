import api from './api';

// Get all conversations
export const getConversations = async () => {
  try {
    const response = await api.get('/api/messages/conversations');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch conversations' };
  }
};

// Get messages for a specific conversation
export const getMessages = async (userId, listingId) => {
  try {
    const response = await api.get(`/api/messages/${userId}/${listingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch messages' };
  }
};

// Send a new message to a chat
export const sendMessage = async (chatId, messageData) => {
  try {
    const response = await api.post(`/api/messages/chat/${chatId}`, messageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send message' };
  }
};

// Start a new chat conversation
export const startChat = async (receiverId, listingId, initialMessage) => {
  try {
    const response = await api.post('/api/messages/start', {
      receiverId,
      listingId,
      message: initialMessage
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to start chat' };
  }
};

// Mark a message as read
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await api.put(`/api/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark message as read' };
  }
};

// Fetch all chats for the current user
export const fetchChats = async () => {
  try {
    const response = await api.get('/api/messages/conversations');
    return { chats: response.data };
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch chats' };
  }
};

// Fetch messages for a specific chat
export const fetchChatMessages = async (chatId) => {
  try {
    const response = await api.get(`/api/messages/chat/${chatId}`);
    return { messages: response.data };
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch chat messages' };
  }
};
