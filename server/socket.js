import { Server } from 'socket.io';
import Message from './src/models/Message.js';
import Chat from './src/models/Chat.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Join a room for private messaging
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        socket.userId = userId.toString();
        console.log(`User ${socket.id} joined room: ${userId}`);
      }
    });
    
    // Handle private messages
    socket.on('private-message', async ({ chatId, message, senderId, receiverId }) => {
      try {
        // Save message to database
        const newMessage = new Message({
          chat: chatId,
          sender: senderId,
          content: message,
        });
        
        await newMessage.save();
        await newMessage.populate('sender', 'name avatar');
        
        // Update chat with last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: newMessage._id,
          updatedAt: Date.now()
        });
        
        // Emit to sender and receiver with consistent event name
        io.to(senderId.toString()).emit('newMessage', newMessage);
        io.to(receiverId.toString()).emit('newMessage', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing', ({ to, isTyping }) => {
      if (to) {
        socket.to(to.toString()).emit('typing', { 
          userId: socket.userId, 
          isTyping 
        });
      }
    });
    
    // Handle joining specific chat rooms
    socket.on('join-chat', (chatId) => {
      if (chatId) {
        socket.join(`chat-${chatId}`);
        console.log(`User ${socket.id} joined chat: ${chatId}`);
      }
    });
    
    // Handle leaving specific chat rooms
    socket.on('leave-chat', (chatId) => {
      if (chatId) {
        socket.leave(`chat-${chatId}`);
        console.log(`User ${socket.id} left chat: ${chatId}`);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};
