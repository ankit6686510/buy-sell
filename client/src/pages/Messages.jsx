import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Badge,
  IconButton,
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';

import { 
  fetchChats, 
  fetchChatMessages, 
  sendMessage 
} from '../services/messageService';
import { 
  fetchChatsStart, 
  fetchChatsSuccess, 
  fetchChatsFailure,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  setActiveChatId,
} from '../store/slices/messageSlice';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { 
    chats, 
    messages, 
    activeChatId, 
    loading, 
    error 
  } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);
  
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  // Initialize the active chat ID from location state if provided
  useEffect(() => {
    if (location.state?.chatId && !activeChatId) {
      dispatch(setActiveChatId(location.state.chatId));
    }
  }, [location.state, dispatch, activeChatId]);
  
  // Fetch chats on component mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        dispatch(fetchChatsStart());
        const data = await fetchChats();
        dispatch(fetchChatsSuccess(data.chats));
        
        // If we don't have an active chat yet, set the first chat as active
        if (!activeChatId && data.chats && data.chats.length > 0) {
          dispatch(setActiveChatId(data.chats[0]._id));
        }
      } catch (err) {
        dispatch(fetchChatsFailure(err.message || 'Failed to load chats'));
      }
    };
    
    if (user) {
      loadChats();
    }
  }, [dispatch, user, activeChatId]);
  
  // Fetch messages when active chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChatId) return;
      
      try {
        dispatch(fetchMessagesStart());
        const data = await fetchChatMessages(activeChatId);
        dispatch(fetchMessagesSuccess(data.messages));
      } catch (err) {
        dispatch(fetchMessagesFailure(err.message || 'Failed to load messages'));
      }
    };
    
    if (user && activeChatId) {
      loadMessages();
    }
  }, [dispatch, user, activeChatId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleChatSelect = (chatId) => {
    dispatch(setActiveChatId(chatId));
  };
  
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeChatId) return;
    
    try {
      setSendingMessage(true);
      dispatch(sendMessageStart());
      
      const data = await sendMessage(activeChatId, { content: newMessage });
      dispatch(sendMessageSuccess(data.message));
      
      setNewMessage('');
    } catch (err) {
      dispatch(sendMessageFailure(err.message || 'Failed to send message'));
    } finally {
      setSendingMessage(false);
    }
  };
  
  const getOtherParticipant = (chat) => {
    if (!chat) return null;
    // Handle both old format (participants array) and new format (participant object)
    if (chat.participants && Array.isArray(chat.participants)) {
      return chat.participants.find(participant => participant._id !== user?._id);
    }
    return chat.participant; // New format from server
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 3 }}>
          Please log in to view your messages
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/login')} 
          sx={{ mt: 2 }}
        >
          Log In
        </Button>
      </Container>
    );
  }
  
  const activeChat = chats.find(chat => chat._id === activeChatId);
  const recipient = activeChat ? getOtherParticipant(activeChat) : null;
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, display: { xs: 'flex', md: 'none' } }}
      >
        Back
      </Button>
      
      <Paper elevation={3} sx={{ height: { xs: 'calc(100vh - 200px)', md: '600px' }, overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Chat List */}
          <Grid 
            item 
            xs={12} 
            md={4} 
            sx={{ 
              borderRight: 1, 
              borderColor: 'divider',
              display: { xs: activeChat ? 'none' : 'block', md: 'block' },
              height: '100%',
              overflow: 'auto'
            }}
          >
            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              Conversations
            </Typography>
            
            {loading && chats.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : chats.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography align="center" color="text.secondary">
                  No conversations yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {chats.map(chat => {
                  const otherUser = getOtherParticipant(chat);
                  const lastMessage = chat.lastMessage;
                  const isActive = chat._id === activeChatId;
                  
                  return (
                    <div key={chat._id}>
                      <ListItem 
                        alignItems="flex-start" 
                        button
                        selected={isActive}
                        onClick={() => handleChatSelect(chat._id)}
                        sx={{ 
                          bgcolor: isActive ? 'action.selected' : 'inherit',
                          '&:hover': { bgcolor: isActive ? 'action.selected' : 'action.hover' }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            color="primary"
                            variant="dot"
                            invisible={!chat.unreadCount}
                          >
                            <Avatar 
                              src={otherUser?.avatar} 
                              alt={otherUser?.name}
                            />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography component="span" variant="subtitle1" noWrap>
                                {otherUser?.name || 'Unknown User'}
                              </Typography>
                              {lastMessage && (
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {formatTime(lastMessage.createdAt)}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              sx={{ 
                                fontWeight: chat.unreadCount ? 'bold' : 'normal',
                                color: chat.unreadCount ? 'text.primary' : 'text.secondary'
                              }}
                            >
                              {lastMessage?.content || 'No messages yet'}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </div>
                  );
                })}
              </List>
            )}
          </Grid>
          
          {/* Chat Messages */}
          <Grid 
            item 
            xs={12} 
            md={8} 
            sx={{ 
              display: { xs: activeChat ? 'block' : 'none', md: 'block' },
              height: '100%',
              position: 'relative'
            }}
          >
            {activeChat ? (
              <>
                {/* Chat Header */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {recipient && (
                    <>
                      <IconButton 
                        sx={{ mr: 1, display: { xs: 'flex', md: 'none' } }} 
                        onClick={() => dispatch(setActiveChatId(null))}
                      >
                        <ArrowBack />
                      </IconButton>
                      <Avatar 
                        src={recipient.avatar} 
                        alt={recipient.name}
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {recipient.name || 'Unknown User'}
                        </Typography>
                        {activeChat.listing && (
                          <Typography variant="caption" color="text.secondary">
                            RE: {activeChat.listing.brand} {activeChat.listing.model}
                          </Typography>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
                
                {/* Messages Container */}
                <Box 
                  ref={messageContainerRef}
                  sx={{ 
                    p: 2, 
                    height: 'calc(100% - 132px)', 
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography align="center" color="text.secondary">
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        if (!message) return null;
                        
                        const isCurrentUser = message.sender && user && message.sender._id === user._id;
                        const showDate = index === 0 || 
                          (messages[index-1] && formatDate(messages[index-1].createdAt) !== formatDate(message.createdAt));
                        
                        return (
                          <div key={message._id}>
                            {showDate && (
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'center', 
                                  mb: 2, 
                                  mt: index > 0 ? 2 : 0 
                                }}
                              >
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    bgcolor: 'grey.100', 
                                    px: 2, 
                                    py: 0.5, 
                                    borderRadius: 4 
                                  }}
                                >
                                  {formatDate(message.createdAt)}
                                </Typography>
                              </Box>
                            )}
                            
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                mb: 1.5,
                              }}
                            >
                              {!isCurrentUser && (
                                <Avatar 
                                  src={message.sender.avatar} 
                                  alt={message.sender.name}
                                  sx={{ mr: 1, width: 32, height: 32 }}
                                />
                              )}
                              
                              <Box
                                sx={{
                                  maxWidth: '70%',
                                  bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
                                  color: isCurrentUser ? 'white' : 'text.primary',
                                  p: 2,
                                  borderRadius: 2,
                                  position: 'relative',
                                }}
                              >
                                <Typography variant="body1">
                                  {message.content}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block', 
                                    textAlign: 'right',
                                    mt: 0.5,
                                    opacity: 0.7
                                  }}
                                >
                                  {formatTime(message.createdAt)}
                                </Typography>
                              </Box>
                              
                              {isCurrentUser && (
                                <Avatar 
                                  src={message.sender.avatar} 
                                  alt={message.sender.name}
                                  sx={{ ml: 1, width: 32, height: 32 }}
                                />
                              )}
                            </Box>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>
                
                {/* Message Input */}
                <Box 
                  component="form" 
                  onSubmit={handleSendMessage}
                  sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid item xs>
                      <TextField
                        fullWidth
                        placeholder="Type a message..."
                        variant="outlined"
                        size="small"
                        value={newMessage}
                        onChange={handleMessageChange}
                        disabled={loading || sendingMessage}
                      />
                    </Grid>
                    <Grid item>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        endIcon={<Send />}
                        disabled={!newMessage.trim() || loading || sendingMessage}
                      >
                        {sendingMessage ? <CircularProgress size={24} /> : 'Send'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary" align="center">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Messages;
