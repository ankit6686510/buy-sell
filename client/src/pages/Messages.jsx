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
    useTheme, // 👈 IMPORTED: For accessing the theme
    alpha, // 👈 IMPORTED: For creating mode-aware colors
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
    const theme = useTheme(); // 👈 Initialized theme
    
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
    
    // --- Dark Mode / Theme-aware Styles ---
    const isDarkMode = theme.palette.mode === 'dark';
    const messageBubbleInColor = theme.palette.primary.main;
    const messageBubbleInText = theme.palette.common.white;
    const messageBubbleOutColor = isDarkMode ? theme.palette.grey[700] : theme.palette.grey[200];
    const messageBubbleOutText = theme.palette.text.primary;
    const dateSeparatorBg = isDarkMode ? alpha(theme.palette.background.default, 0.6) : theme.palette.grey[100];
    // --- End Theme Styles ---

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, display: { xs: 'flex', md: 'none' } }}
            >
                Back
            </Button>
            
            <Paper 
                elevation={6} // Increased elevation for a better contrast effect
                sx={{ 
                    height: { xs: 'calc(100vh - 200px)', md: '600px' }, 
                    overflow: 'hidden',
                    bgcolor: 'background.paper' // Ensure Paper background respects theme
                }}
            >
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
                            overflowY: 'auto',
                            // Custom style for the chat list side if needed
                            bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.8) : theme.palette.background.paper,
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                p: 2, 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                fontWeight: 600
                            }}
                        >
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
                                                    // 👈 DARK MODE FIX: Using action colors which flip automatically
                                                    bgcolor: isActive ? theme.palette.action.selected : 'inherit',
                                                    '&:hover': { 
                                                        bgcolor: isActive ? theme.palette.action.selected : theme.palette.action.hover 
                                                    },
                                                    py: 1.5
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Badge
                                                        color="secondary" // Changed from primary to secondary for better visibility on a selected list item
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
                                                            <Typography component="span" variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
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
                                                                // 👈 DARK MODE FIX: Making unread text clearly visible
                                                                fontWeight: chat.unreadCount ? 'bold' : 'normal',
                                                                color: chat.unreadCount ? theme.palette.text.primary : theme.palette.text.secondary
                                                            }}
                                                        >
                                                            {lastMessage?.content || 'No messages yet'}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider component="li" sx={{ ml: 2, mr: 2, borderColor: 'divider' }} />
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
                                        alignItems: 'center',
                                        bgcolor: 'background.paper' // Ensures header is separate
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
                                                <Typography variant="subtitle1" fontWeight={600}>
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
                                        // Calculates height (Paper height - Header height - Input Box height)
                                        height: 'calc(100% - 140px)', 
                                        overflowY: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        // 👈 DARK MODE FIX: Use background.default for chat background
                                        bgcolor: theme.palette.background.default
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
                                                                        // 👈 DARK MODE FIX: Using theme colors for date separator
                                                                        bgcolor: dateSeparatorBg, 
                                                                        color: 'text.secondary',
                                                                        px: 2, 
                                                                        py: 0.5, 
                                                                        borderRadius: 4,
                                                                        boxShadow: theme.shadows[1]
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
                                                                    // 👈 DARK MODE FIX: Dynamic colors for message bubbles
                                                                    bgcolor: isCurrentUser ? messageBubbleInColor : messageBubbleOutColor,
                                                                    color: isCurrentUser ? messageBubbleInText : messageBubbleOutText,
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
                                                                        // Ensures timestamp is visible on both colors
                                                                        color: isCurrentUser ? alpha(messageBubbleInText, 0.8) : alpha(messageBubbleOutText, 0.7)
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
                                        bgcolor: 'background.paper' // Ensures input bar respects theme
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
                                                endIcon={sendingMessage ? undefined : <Send />}
                                                disabled={!newMessage.trim() || loading || sendingMessage}
                                                sx={{ height: '100%' }}
                                            >
                                                {sendingMessage ? <CircularProgress size={24} color="inherit" /> : 'Send'}
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