import express from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  startChat
} from '../controllers/messageController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

router.post('/chat/:chatId', sendMessage);
router.post('/start', startChat);
router.get('/conversations', getConversations);
router.get('/chat/:chatId', getMessages);
router.put('/:messageId/read', markAsRead);

export default router;
