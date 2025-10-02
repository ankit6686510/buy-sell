import Message from '../models/Message.js';
import ProductListing from '../models/ProductListing.js';
import Chat from '../models/Chat.js';

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    // Find the chat to verify user is a participant
    const chat = await Chat.findById(chatId).populate('participants');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is a participant in this chat
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    // Create new message
    const message = new Message({
      chat: chatId,
      sender: req.user.id,
      content,
      metadata: {
        listingId: chat.listing
      }
    });

    await message.save();

    // Update chat's lastMessage
    chat.lastMessage = message._id;
    await chat.save();

    // Populate the message for response
    await message.populate('sender', 'name avatar');

    // Get other participants to send socket events
    const otherParticipants = chat.participants.filter(p => p._id.toString() !== req.user.id);
    
    // Emit socket event for real-time chat
    const io = req.app.get('io');
    if (io) {
      otherParticipants.forEach(participant => {
        io.to(participant._id.toString()).emit('newMessage', message);
      });
    }

    res.status(201).json({
      message: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    // Find all chats where user is a participant
    const chats = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'name avatar')
    .populate('listing', 'brand model condition price')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name avatar'
      }
    })
    .sort({ updatedAt: -1 });

    // For each chat, calculate unread count
    const conversations = await Promise.all(chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: req.user.id },
        readBy: { $not: { $elemMatch: { user: req.user.id } } }
      });

      // Get the other participant (not the current user)
      const otherParticipant = chat.participants.find(p => p._id.toString() !== req.user.id);

      return {
        _id: chat._id,
        listing: chat.listing,
        participant: otherParticipant,
        lastMessage: chat.lastMessage,
        unreadCount,
        updatedAt: chat.updatedAt
      };
    }));

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify user is a participant in this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    // Get all messages in this chat
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('replyTo', 'content sender');

    // Mark messages as read by current user
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            readAt: new Date()
          }
        }
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

export const startChat = async (req, res) => {
  try {
    const { receiverId, listingId, message } = req.body;

    // Verify that the listing exists
    const listing = await ProductListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Verify that the receiver is the owner of the listing
    if (listing.user.toString() !== receiverId) {
      return res.status(403).json({ message: 'Invalid receiver for this listing' });
    }

    // Check if user is trying to message themselves
    if (req.user.id === receiverId) {
      return res.status(400).json({ message: "You can't message yourself" });
    }

    // Check if a chat already exists between these users for this listing
    let existingChat = await Chat.findOne({
      participants: { $all: [req.user.id, receiverId] },
      listing: listingId
    });

    let chat;
    if (existingChat) {
      chat = existingChat;
    } else {
      // Create a new chat
      chat = new Chat({
        participants: [req.user.id, receiverId],
        listing: listingId
      });
      await chat.save();
    }

    // Create the initial message
    const newMessage = new Message({
      chat: chat._id,
      sender: req.user.id,
      content: message,
      metadata: {
        listingId: listingId
      }
    });

    await newMessage.save();

    // Update the chat's lastMessage
    chat.lastMessage = newMessage._id;
    await chat.save();

    // Populate the message with user details
    await newMessage.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'chat', populate: { path: 'participants', select: 'name avatar' } }
    ]);

    // Emit socket event for real-time chat
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('newMessage', newMessage);
    }

    res.status(201).json({
      message: 'Chat started successfully',
      chat: {
        _id: chat._id,
        participants: chat.participants,
        listing: chat.listing,
        lastMessage: newMessage,
        createdAt: chat.createdAt
      },
      initialMessage: newMessage
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ message: 'Failed to start chat', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is already in readBy array
    const alreadyRead = message.readBy.some(read => read.user.toString() === req.user.id);
    
    if (!alreadyRead) {
      message.readBy.push({
        user: req.user.id,
        readAt: new Date()
      });
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
};
