import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, FiUsers, FiSearch, FiArrowLeft, 
  FiMoreVertical, FiCheck, FiCheckCircle, FiPlus, FiX, FiMessageSquare 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import websocketService from '../../services/websocket';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const DirectMessagesPage = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [communityMembers, setCommunityMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔌 Initializing WebSocket connection...');
      websocketService.connect(
        token,
        () => {
          setWsConnected(true);
          console.log('✅ WebSocket connected, subscribing to messages...');
          
          // Subscribe to user messages
          websocketService.subscribeToUserMessages((message) => {
            handleNewMessage(message);
          });
        },
        (error) => {
          console.error('❌ WebSocket error:', error);
          toast.error('Connection lost. Trying to reconnect...');
          setWsConnected(false);
        }
      );
    }

    return () => {
      console.log('🔌 Cleaning up WebSocket connection...');
      websocketService.disconnect();
    };
  }, []); // Empty deps - only run once on mount

  // Fetch conversations
  useEffect(() => {
    if (communityId) {
      fetchConversations();
    }
  }, [communityId]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.userId);
      // Mark conversation as selected and reset unread count
      setConversations(prev => 
        prev.map(conv => 
          Number(conv.userId) === Number(selectedConversation.userId) 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching conversations for community:', communityId);
      const response = await api.messages.getConversations(communityId);
      console.log('✅ Conversations API response:', response.data);
      
      const conversationList = response.data || [];
      console.log('📋 Conversation count:', conversationList.length);
      
      // Log last message details for debugging
      conversationList.forEach((conv, i) => {
        console.log(`  Conversation ${i + 1}:`, {
          name: conv.name,
          lastMessage: conv.lastMessage?.substring(0, 30),
          lastMessageSenderId: conv.lastMessageSenderId,
          currentUserId: user?.userId
        });
      });
      
      setConversations(conversationList);

      // Auto-select first conversation if available and none is currently selected
      if (conversationList.length > 0 && !selectedConversation) {
        console.log('🎯 Auto-selecting first conversation:', conversationList[0]);
        setSelectedConversation(conversationList[0]);
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load conversations');
      setConversations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (receiverId) => {
    try {
      console.log('📨 Fetching messages for user:', receiverId);
      const response = await api.messages.getConversation(receiverId);
      console.log('✅ Messages API response:', response.data);
      
      // The response has a messages property - reverse it for chronological order (oldest first)
      const messages = response.data.messages || [];
      console.log('📬 Message count:', messages.length);
      
      setMessages(messages.reverse());
      
      // Mark messages as read
      await markMessagesAsRead(receiverId);
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load messages');
    }
  };

  const markMessagesAsRead = async (senderId) => {
    try {
      // Update the UI immediately
      setConversations(prev => 
        prev.map(conv => 
          Number(conv.userId) === Number(senderId) ? { ...conv, unreadCount: 0 } : conv
        )
      );
      
      // Note: Message read status is typically tracked server-side via WebSocket
      // or a separate API call. For now, we're just updating the local UI.
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleNewMessage = (message) => {
    console.log('📨 New message received:', message);
    console.log('👤 Current user ID:', user?.userId);
    console.log('💬 Selected conversation:', selectedConversation);
    
    // Ensure type consistency for ID comparisons
    const messageSenderId = Number(message.senderId);
    const messageReceiverId = Number(message.receiverId);
    const currentUserId = Number(user?.userId);
    const selectedUserId = Number(selectedConversation?.userId);
    
    // If message is from or to current conversation, add to messages
    if (selectedConversation) {
      const isForCurrentConversation = 
        (messageSenderId === selectedUserId && messageReceiverId === currentUserId) ||
        (messageReceiverId === selectedUserId && messageSenderId === currentUserId);
      
      console.log('✅ Is for current conversation:', isForCurrentConversation);
      console.log('   - message.senderId:', messageSenderId, 'selectedConversation.userId:', selectedUserId);
      console.log('   - message.receiverId:', messageReceiverId, 'user.userId:', currentUserId);
      
      if (isForCurrentConversation) {
        console.log('➕ Adding message to current conversation');
        console.log('   Message details:', {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content.substring(0, 30)
        });
        
        setMessages(prev => {
          // Remove optimistic message with same content (only if this is the real message)
          const withoutOptimistic = prev.filter(m => 
            !(m.isOptimistic && m.content === message.content && 
              Number(m.senderId) === messageSenderId && Number(m.receiverId) === messageReceiverId)
          );
          
          console.log('🧹 Filtered optimistic messages:', {
            before: prev.length,
            after: withoutOptimistic.length,
            removed: prev.length - withoutOptimistic.length
          });
          
          // Check if real message already exists (avoid duplicates)
          const exists = withoutOptimistic.some(m => m.id === message.id);
          if (exists) {
            console.log('⚠️ Message already exists, skipping duplicate');
            return withoutOptimistic;
          }
          
          console.log('✨ Adding new message to messages array');
          const newMessages = [...withoutOptimistic, message];
          console.log('📊 Messages array updated:', {
            totalMessages: newMessages.length,
            lastMessageId: message.id
          });
          // Add the new message
          return newMessages;
        });
        
        // Mark as read if it's from the other person and conversation is active
        if (messageSenderId === selectedUserId) {
          markMessagesAsRead(selectedConversation.userId);
        }
      }
    }

    // Update conversations list to reflect new message
    setConversations(prev => {
      const otherUserId = messageSenderId === currentUserId ? messageReceiverId : messageSenderId;
      
      // Check if conversation exists
      const convExists = prev.some(conv => Number(conv.userId) === otherUserId);
      
      if (convExists) {
        // Update existing conversation and move it to top
        const updated = prev.map(conv => {
          if (Number(conv.userId) === otherUserId) {
            return {
              ...conv,
              lastMessage: message.content,
              lastMessageTime: message.timestamp || message.createdAt,
              lastMessageSenderId: messageSenderId,
              // Only increment unread count if message is from other person and conversation is not active
              unreadCount: messageSenderId === currentUserId 
                ? conv.unreadCount 
                : (selectedUserId === otherUserId ? 0 : (conv.unreadCount || 0) + 1)
            };
          }
          return conv;
        });
        
        // Sort conversations by last message time (most recent first)
        return updated.sort((a, b) => {
          const timeA = new Date(a.lastMessageTime || 0).getTime();
          const timeB = new Date(b.lastMessageTime || 0).getTime();
          return timeB - timeA;
        });
      } else {
        // This is a new conversation - add it to the list
        // Fetch the user details for the new conversation
        if (messageSenderId !== currentUserId) {
          // Message from someone new
          const newConv = {
            userId: message.senderId,
            name: message.senderName || 'New User',
            email: message.senderEmail || '',
            lastMessage: message.content,
            lastMessageTime: message.timestamp || message.createdAt,
            lastMessageSenderId: messageSenderId,
            unreadCount: 1
          };
          return [newConv, ...prev];
        }
        return prev;
      }
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageContent.trim() || !selectedConversation || !wsConnected) {
      if (!wsConnected) {
        toast.error('Connection lost. Please wait while we reconnect...');
      }
      return;
    }

    // Prevent sending messages to yourself
    if (Number(selectedConversation.userId) === Number(user.userId)) {
      toast.error('You cannot send messages to yourself');
      return;
    }

    const contentToSend = messageContent.trim();
    const tempId = `temp-${Date.now()}`;

    console.log('📤 Sending message:', {
      content: contentToSend,
      to: selectedConversation.userId,
      from: user.userId,
      communityId: parseInt(communityId),
      tempId
    });

    try {
      setSending(true);
      
      // Optimistically add message to UI immediately
      const optimisticMessage = {
        id: tempId,
        senderId: user.userId,
        receiverId: selectedConversation.userId,
        content: contentToSend,
        timestamp: new Date().toISOString(),
        isRead: false,
        isOptimistic: true // Flag to identify temporary messages
      };
      
      console.log('🎯 Creating optimistic message:', {
        senderId: user.userId,
        senderIdType: typeof user.userId,
        receiverId: selectedConversation.userId,
        currentUser: user
      });
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send via WebSocket
      websocketService.sendChatMessage(
        selectedConversation.userId,
        parseInt(communityId),
        contentToSend
      );

      // Update conversation list with last message
      setConversations(prev => 
        prev.map(conv => 
          Number(conv.userId) === Number(selectedConversation.userId)
            ? { ...conv, lastMessage: contentToSend, lastMessageTime: new Date().toISOString(), lastMessageSenderId: user.userId }
            : conv
        )
      );

      // Clear input immediately for better UX
      setMessageContent('');
      
      // Focus back on input
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
      
      // Remove optimistic message after 10 seconds if real one doesn't arrive
      // (Increased from 5s to allow for slower network/server response)
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout: Removing optimistic message', tempId);
        setMessages(prev => {
          const stillExists = prev.some(m => m.id === tempId);
          if (stillExists) {
            console.log('⚠️ Real message never arrived, removing optimistic message');
          }
          return prev.filter(m => m.id !== tempId);
        });
      }, 10000);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      toast.error('Failed to send message. Please try again.');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      // Restore the message content so user doesn't lose their text
      setMessageContent(contentToSend);
    } finally {
      setSending(false);
      console.log('✅ Send message operation completed');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCommunityMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await api.members.getAll(communityId);
      // Filter out current user from the list
      const members = (response.data || []).filter(member => member.userId !== user.userId);
      setCommunityMembers(members);
    } catch (error) {
      console.error('Error fetching community members:', error);
      toast.error('Failed to load community members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleStartConversation = (member) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => Number(conv.userId) === Number(member.userId));
    
    if (existingConv) {
      // Select existing conversation
      setSelectedConversation(existingConv);
      setShowNewMessageModal(false);
      toast.info('Conversation already exists');
    } else {
      // Create new conversation object
      const newConv = {
        userId: member.userId,
        name: member.fullName || member.username,
        email: member.email,
        profileImageUrl: member.profileImageUrl,
        lastMessage: null,
        lastMessageTime: null,
        lastMessageSenderId: null,
        unreadCount: 0
      };
      
      // Add to conversations list
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setShowNewMessageModal(false);
      
      // Focus on message input
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  };

  const filteredMembers = communityMembers.filter(member =>
    member.userId !== user.userId && (
      member.fullName?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      member.username?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(memberSearchQuery.toLowerCase())
    )
  );

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="glass border-b border-gray-200 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate(`/community/${communityId}`)}>
                <FiArrowLeft className="mr-2" />
                Back to Community
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Direct Messages
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              {wsConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm">Connecting...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className="card p-4 flex flex-col overflow-hidden">
            {/* New Message Button */}
            <div className="mb-4">
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  setShowNewMessageModal(true);
                  fetchCommunityMembers();
                }}
              >
                <FiPlus className="mr-2" />
                New Message
              </Button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2" style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E0 transparent'
            }}>
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-600">No conversations yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start chatting with community members
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv, index) => (
                  <motion.div
                    key={conv.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedConversation(conv);
                      // Scroll to top of messages when switching conversations
                      setTimeout(() => scrollToBottom(), 100);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      Number(selectedConversation?.userId) === Number(conv.userId)
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                        : 'hover:bg-gray-100 hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                        Number(selectedConversation?.userId) === Number(conv.userId)
                          ? 'bg-white/20 text-white'
                          : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                      }`}>
                        {conv.name?.charAt(0).toUpperCase() || 'U'}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-semibold truncate ${
                            Number(selectedConversation?.userId) === Number(conv.userId) ? 'text-white' : 'text-gray-900'
                          }`}>
                            {conv.name || conv.email}
                          </p>
                          {conv.lastMessageTime && (
                            <span className={`text-xs flex-shrink-0 ml-2 ${
                              Number(selectedConversation?.userId) === Number(conv.userId) ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {formatMessageTime(conv.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-2">
                            {conv.lastMessage ? (
                              <p className={`text-sm truncate ${
                                Number(selectedConversation?.userId) === Number(conv.userId) ? 'text-white/80' : 'text-gray-600'
                              }`}>
                                {Number(conv.lastMessageSenderId) === Number(user?.userId) ? (
                                  <>
                                    <span className={`font-semibold ${
                                      Number(selectedConversation?.userId) === Number(conv.userId) ? 'text-white' : 'text-primary-600'
                                    }`}>You:</span>
                                    <span className="ml-1">{conv.lastMessage}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-medium">{conv.name?.split(' ')[0] || 'Them'}:</span>
                                    <span className="ml-1 font-normal">{conv.lastMessage}</span>
                                  </>
                                )}
                              </p>
                            ) : (
                              <p className={`text-sm italic ${
                                Number(selectedConversation?.userId) === Number(conv.userId) ? 'text-white/60' : 'text-gray-500'
                              }`}>
                                No messages yet
                              </p>
                            )}
                          </div>
                          
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 card flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                        {selectedConversation.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.name}
                        </h3>
                        <p className="text-sm text-gray-600">{selectedConversation.email}</p>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      <FiMoreVertical />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gray-50/30" 
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E0 #F7FAFC'
                  }}
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FiMessageSquare className="mx-auto text-4xl text-gray-400 mb-3" />
                        <p className="text-gray-600">No messages yet</p>
                        <p className="text-sm text-gray-500 mt-1">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {messages.map((message, index) => {
                        // Ensure consistent type comparison (convert to numbers)
                        const messageSenderId = Number(message.senderId);
                        const currentUserId = Number(user?.userId);
                        const isOwnMessage = messageSenderId === currentUserId;
                        
                        // DEBUG: Log detailed comparison
                        if (index === messages.length - 1) { // Only log last message to reduce noise
                          console.log('🔍 MESSAGE COMPARISON DEBUG:');
                          console.log('  Raw message.senderId:', message.senderId, 'Type:', typeof message.senderId);
                          console.log('  Raw user.userId:', user?.userId, 'Type:', typeof user?.userId);
                          console.log('  Converted messageSenderId:', messageSenderId);
                          console.log('  Converted currentUserId:', currentUserId);
                          console.log('  isOwnMessage:', isOwnMessage);
                          console.log('  user object:', user);
                          console.log('  selectedConversation:', selectedConversation);
                        }
                        
                        const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, x: isOwnMessage ? 50 : -50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 500, 
                              damping: 30,
                              duration: 0.3
                            }}
                            className={`flex items-end space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
                          >
                            {/* Avatar */}
                            {showAvatar ? (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}>
                                {isOwnMessage 
                                  ? (user.fullName?.charAt(0) || user.username?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()
                                  : (selectedConversation.name?.charAt(0) || selectedConversation.email?.charAt(0) || 'U').toUpperCase()
                                }
                              </div>
                            ) : (
                              <div className="w-8"></div>
                            )}

                            {/* Message Bubble */}
                            <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                            <motion.div 
                              className={`px-4 py-2 rounded-2xl ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-none'
                                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <p className="text-sm break-words">{message.content}</p>
                            </motion.div>
                            
                            <div className="flex items-center space-x-1 mt-1 px-2">
                              <span className="text-xs text-gray-500">
                                {message.timestamp ? formatMessageTime(message.timestamp) : 'Sending...'}
                              </span>
                              {isOwnMessage && (
                                message.isOptimistic ? (
                                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : message.isRead ? (
                                  <FiCheckCircle className="text-xs text-blue-500" />
                                ) : (
                                  <FiCheck className="text-xs text-gray-400" />
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type a message..."
                      disabled={!wsConnected || sending}
                      className="flex-1 input"
                    />
                    <Button
                      type="submit"
                      disabled={!messageContent.trim() || !wsConnected || sending}
                      className="px-6"
                    >
                      {sending ? (
                        <div className="spinner w-5 h-5 border-2"></div>
                      ) : (
                        <>
                          <FiSend className="mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FiUsers className="mx-auto text-6xl text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      <Modal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        title="New Message"
      >
        <div className="space-y-4">
          {/* Search Members */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Members List */}
          <div 
            className="max-h-96 overflow-y-auto space-y-2 pr-2" 
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E0 transparent'
            }}
          >
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <FiUsers className="mx-auto text-4xl text-gray-400 mb-3" />
                <p className="text-gray-600">No members found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {memberSearchQuery ? 'Try a different search term' : 'Invite members to start messaging'}
                </p>
              </div>
            ) : (
              filteredMembers.map((member, index) => (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartConversation(member)}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-all border border-gray-200 hover:border-primary-300 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                      {(member.fullName?.charAt(0) || member.username?.charAt(0) || member.email?.charAt(0) || 'U').toUpperCase()}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {member.fullName || member.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{member.email}</p>
                      {member.role && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {member.role === 'ADMINISTRATOR' ? '👑 Admin' : 
                           member.role === 'MODERATOR' ? '🛡️ Moderator' : '👤 Member'}
                        </p>
                      )}
                    </div>

                    {/* Arrow Icon */}
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => setShowNewMessageModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DirectMessagesPage;
