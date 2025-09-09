import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Users, 
  Paperclip, 
  Smile,
  Check,
  CheckCheck
} from 'lucide-react';
import useStore from '../store/useStore.js';

// Format time for chat messages (WhatsApp style)
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Message status component
const MessageStatus = ({ status, isSent }) => {
  if (!isSent) return null;
  
  switch (status) {
    case 'sending':
      return <div className="w-4 h-4 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>;
    case 'sent':
      return <Check size={16} className="text-gray-400" />;
    case 'delivered':
      return <CheckCheck size={16} className="text-gray-400" />;
    case 'read':
      return <CheckCheck size={16} className="text-green-500" />;
    case 'failed':
      return <span className="text-xs text-red-400">⚠️</span>;
    default:
      return <Check size={16} className="text-gray-300" />;
  }
};

// Individual message component (WhatsApp style) - Memoized for performance
const ChatMessage = React.memo(({ message, isOwn }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
          isOwn
            ? 'text-white rounded-br-none'
            : 'text-white rounded-bl-none shadow-sm'
        }`}
        style={isOwn 
          ? {
              background: 'linear-gradient(90deg, rgba(31, 41, 55, 0.9), rgba(18, 18, 18, 0.9))',
              boxShadow: '0 0 15px rgba(31, 41, 55, 0.4)',
              border: '1px solid rgba(55, 65, 81, 0.3)'
            }
          : {
              background: 'linear-gradient(90deg, rgba(28, 28, 28, 0.9), rgba(18, 18, 18, 0.9))',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(55, 65, 81, 0.3)'
            }
        }
      >
        {/* Message content */}
        {message.type === 'text' && (
          <div>
            <p className="text-sm">{message.content}</p>
          </div>
        )}
        
        {message.type === 'image' && (
          <div>
            <img 
              src={message.imageUrl} 
              alt="Shared image" 
              className="h-auto max-w-full mb-1 rounded-lg"
              style={{ maxHeight: '200px' }}
            />
            {message.caption && (
              <p className="mt-1 text-sm">{message.caption}</p>
            )}
          </div>
        )}

        {/* Message metadata */}
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          isOwn ? 'text-gray-300' : 'text-gray-300'
        }`}>
          <span className="text-xs">{formatTime(message.timestamp)}</span>
          <MessageStatus status={message.status} isSent={isOwn} />
        </div>

        {/* Message tail */}
        <div
          className={`absolute bottom-0 ${
            isOwn
              ? 'right-0 transform translate-x-1 border-l-8 border-t-8 border-t-transparent'
              : 'left-0 transform -translate-x-1 border-r-8 border-t-8 border-t-transparent'
          }`}
          style={isOwn 
            ? { borderLeftColor: 'rgba(31, 41, 55, 0.9)', width: 0, height: 0 }
            : { borderRightColor: 'rgba(28, 28, 28, 0.9)', width: 0, height: 0 }
          }
        />
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';

// Notification component - Memoized for performance
const NotificationMessage = React.memo(({ notification }) => {
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'join':
        return {
          background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: 'rgb(34, 197, 94)'
        };
      case 'leave':
        return {
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'rgb(239, 68, 68)'
        };
      case 'online':
        return {
          background: 'linear-gradient(90deg, rgba(55, 65, 81, 0.2), rgba(31, 41, 55, 0.2))',
          border: '1px solid rgba(55, 65, 81, 0.3)',
          color: 'rgb(156, 163, 175)'
        };
      case 'warning':
        return {
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: 'rgb(245, 158, 11)'
        };
      default:
        return {
          background: 'linear-gradient(90deg, rgba(156, 163, 175, 0.2), rgba(107, 114, 128, 0.2))',
          border: '1px solid rgba(156, 163, 175, 0.3)',
          color: 'rgb(156, 163, 175)'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex justify-center mb-2"
    >
      <div
        className="px-3 py-1 text-xs font-medium rounded-full"
        style={getNotificationStyle(notification.type)}
      >
        {notification.message}
      </div>
    </motion.div>
  );
});

NotificationMessage.displayName = 'NotificationMessage';

const GroupChatWhatsApp = () => {
  const { addNotification } = useStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('general'); // eslint-disable-line no-unused-vars
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCaption, setImageCaption] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [roomInfo, setRoomInfo] = useState({ name: 'Akash Share Group Chat', memberCount: 0 });
  
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);
  const connectionLockRef = useRef(false); // Global lock to prevent multiple simultaneous connections
  const maxReconnectAttempts = 5;
  // Prevent duplicate notifications and noisy UI
  const hasAnnouncedConnectionRef = useRef(false);
  const lastOnlineCountRef = useRef(null);
  const notificationCacheRef = useRef(new Set());
  const lastNotificationTimeRef = useRef(new Map());

  // Log component mount/unmount
  useEffect(() => {
    // Component mounted
    isMountedRef.current = true;
    
    return () => {
      // Component unmounting
      isMountedRef.current = false;
    };
  }, []);

  // Add notification helper with aggressive deduplication
  const addNotificationMessage = useCallback((message, type = 'info') => {
    const now = Date.now();
    const messageKey = `${type}:${message}`;
    
    // Check if we've shown this exact notification recently (within 10 seconds)
    const lastTime = lastNotificationTimeRef.current.get(messageKey);
    if (lastTime && (now - lastTime) < 10000) {
      console.log('🚫 Skipping duplicate notification:', message);
      return;
    }
    
    // Aggressive deduplication: check if notification already exists in current list
    const currentNotifications = notifications;
    if (currentNotifications.some(n => n.message === message && n.type === type)) {
      console.log('🚫 Notification already in queue:', message);
      return;
    }
    
    // Cache this notification
    lastNotificationTimeRef.current.set(messageKey, now);
    notificationCacheRef.current.add(messageKey);
    
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => {
      // Double-check for duplicates before adding
      if (prev.some(n => n.message === message && n.type === type)) {
        console.log('🚫 Last-second duplicate check blocked:', message);
        return prev;
      }
      return [...prev, notification];
    });
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
    
    // Clean up old cache entries after 15 seconds
    setTimeout(() => {
      lastNotificationTimeRef.current.delete(messageKey);
      notificationCacheRef.current.delete(messageKey);
    }, 15000);
  }, [notifications]);

  // Handle joining chat with username
  const handleJoinChat = useCallback(() => {
    if (!tempUsername.trim()) return;
    
    console.log('🔧 handleJoinChat called with username:', tempUsername.trim());
    setUsername(tempUsername.trim());
    setShowNameModal(false);
  }, [tempUsername]);

  // Handle name input key press
  const handleNameKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleJoinChat();
    }
  }, [handleJoinChat]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // WebSocket connection (temporary storage - clears when app closes)
  const connectToChat = useCallback(() => {
    console.log('🔧 connectToChat called with username:', username);
    console.log('🔧 Component mounted:', isMountedRef.current);
    
    // Reset connection state if there was an error
    if (!username) {
      console.log('❌ No username provided, skipping connection');
      return;
    }
    
    // Check if component is still mounted
    if (!isMountedRef.current) {
      console.log('❌ Component not mounted, skipping connection');
      return;
    }

    // Prevent rapid reconnections - debounce mechanism
    const now = Date.now();
    if (now - (wsRef.current?.lastConnectionAttempt || 0) < 2000) {
      console.log('🔧 Debouncing connection attempt (too soon since last attempt)');
      return;
    }
    
    // GLOBAL CONNECTION LOCK - prevent any new connections if one is in progress
    if (connectionLockRef.current) {
      console.log('🚫 CONNECTION BLOCKED: Global connection lock is active');
      return;
    }
    
    // Prevent connection if already connecting or connected
    if (isConnecting) {
      console.log('🔧 Already connecting, skipping new connection attempt');
      return;
    }
    
    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('🔧 Already connected and WebSocket is open, skipping new connection attempt');
      return;
    }
    
    // Check if there's already an active WebSocket
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      console.log('🔧 WebSocket already exists and not closed, skipping new connection');
      return;
    }
    
    // Acquire global connection lock
    connectionLockRef.current = true;
    console.log('🔒 CONNECTION LOCK ACQUIRED');
    
    // Check if we've exceeded max reconnect attempts
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log(`❌ Akash Share Group Chat: Max reconnect attempts (${maxReconnectAttempts}) reached`);
      setIsConnecting(false);
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: `Failed to connect after ${maxReconnectAttempts} attempts. Please refresh the page.`
      });
      return;
    }
    
    // Only prevent reconnection if we're actually connected
    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('🔗 General Chat: Already connected, skipping reconnection');
      setReconnectAttempts(0); // Reset reconnect attempts on successful connection
      return;
    }
    
    // If we're in the middle of connecting, don't start another connection
    if (isConnecting) {
      console.log('🔗 General Chat: Already connecting, skipping reconnection');
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any existing notifications
    setNotifications([]);
    
    setIsConnecting(true);
    
    try {
      // Force WebSocket to connect to backend on port 5003
      const protocol = 'ws:'; // Always use ws for local development
      const host = 'localhost:5003'; // Force localhost:5003 for backend
      const wsUrl = `${protocol}//${host}/chat?username=${encodeURIComponent(username)}&room=${encodeURIComponent(currentRoom)}`;
      
      console.log('🔗 Connecting to WebSocket:', wsUrl);
      console.log('🔧 Frontend location:', window.location.href);
      console.log('🔧 Browser info:', navigator.userAgent);
      console.log('🔧 Current connection state:', { isConnected, isConnecting, reconnectAttempts });
      
      // Check if WebSocket is supported
      if (typeof WebSocket === 'undefined') {
        throw new Error('WebSocket is not supported in this browser');
      }
      
      const ws = new WebSocket(wsUrl);
      
      // Track connection attempt timestamp for debouncing
      ws.lastConnectionAttempt = Date.now();
      
      // Log WebSocket events for debugging
      console.log('🔧 WebSocket object created:', ws.constructor.name);
      console.log('🔧 WebSocket readyState:', ws.readyState);
      
      // Add a flag to track if we've already handled the connection result
      let connectionHandled = false;

      ws.onopen = () => {
        console.log('🔧 WebSocket onopen event triggered');
        console.log('🔧 WebSocket readyState in onopen:', ws.readyState);
        
        if (connectionHandled) {
          console.log('🔧 Connection already handled, skipping onopen');
          return;
        }
        connectionHandled = true;
        
        if (!isMountedRef.current) {
          console.log('🔧 Component not mounted, skipping onopen');
          return;
        }
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0); // Reset reconnect attempts on successful connection
        
        // Release connection lock on successful connection
        connectionLockRef.current = false;
        console.log('🔓 CONNECTION LOCK RELEASED (success)');
        // Announce connection only once until a disconnect happens
        if (!hasAnnouncedConnectionRef.current) {
          addNotificationMessage(`Connected to Akash Share Group Chat as ${username} 🎓`, 'online');
          // Use a deduplication key for store notifications too
          const connectKey = `connect-${username}-${Date.now()}`;
          if (!notificationCacheRef.current.has(connectKey)) {
            addNotification({
              type: 'success',
              title: 'Connected',
              message: 'Connected to group chat'
            });
            notificationCacheRef.current.add(connectKey);
            setTimeout(() => notificationCacheRef.current.delete(connectKey), 5000);
          }
          hasAnnouncedConnectionRef.current = true;
        }
        console.log('✅ Connected to Akash Share Group Chat System - isConnected:', true);
        console.log('✅ Chat input should now be enabled');
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'message': {
              const receivedMessage = {
                id: data.messageId || Date.now() + Math.random(),
                content: data.message,
                username: data.username,
                timestamp: data.timestamp || new Date().toISOString(),
                type: 'text',
                status: 'delivered',
                ai: data.ai || {}
              };
              
              setMessages(prev => [...prev, receivedMessage]);
              console.log('📨 Message received from:', data.username);
              break;
            }
              
            case 'image':
              setMessages(prev => [...prev, {
                id: data.messageId || Date.now() + Math.random(),
                imageUrl: data.imageUrl,
                caption: data.caption || '',
                username: data.username,
                timestamp: data.timestamp || new Date().toISOString(),
                type: 'image',
                status: 'delivered',
                ai: data.ai || {}
              }]);
              break;
              
            case 'userJoined':
              if (data.username && data.username !== username) {
                addNotificationMessage(`${data.username} joined the chat`, 'join');
              }
              break;
              
            case 'userLeft':
              if (data.username && data.username !== username) {
                addNotificationMessage(`${data.username} left the chat`, 'leave');
              }
              break;
              
            case 'messageHistory':
              if (data.messages && Array.isArray(data.messages)) {
                const historyMessages = data.messages.map(msg => ({
                  id: msg.id || Date.now() + Math.random(),
                  content: msg.content,
                  imageUrl: msg.imageUrl,
                  caption: msg.caption,
                  username: msg.username,
                  timestamp: msg.timestamp,
                  type: msg.type || 'text',
                  status: 'delivered',
                  ai: msg.ai || {}
                }));
                setMessages(prev => [...historyMessages, ...prev]);
              }
              break;
              
            case 'aiWelcome':
              console.log('🎓 Akash Share Group Chat Features enabled:', data.features);
              addNotificationMessage(`Akash Share Group Chat Features: ${data.features.join(', ')} 🎓`, 'online');
              break;
              
            case 'userList':
              if (data.users && Array.isArray(data.users)) {
                const count = data.users.length;
                setOnlineMembers(data.users);
                setRoomInfo(prev => ({ ...prev, memberCount: count }));
                // Only announce when the count changes to avoid spam
                if (lastOnlineCountRef.current !== count) {
                  addNotificationMessage(`Online members: ${count}${count > 0 ? ` (${data.users.slice(0, 3).join(', ')}${count > 3 ? '...' : ''})` : ''}`, 'online');
                  lastOnlineCountRef.current = count;
                }
              }
              break;
              
            case 'roomInfo':
              if (data.roomName && data.memberCount) {
                setRoomInfo({ name: data.roomName, memberCount: data.memberCount });
                addNotificationMessage(`Room: ${data.roomName} - ${data.memberCount} members`, 'online');
              }
              break;
              
            case 'messageBlocked':
              addNotificationMessage(`Message blocked: ${data.reason} - ${data.suggestion}`, 'warning');
              break;
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.log('🔧 WebSocket onerror event triggered');
        console.log('🔧 WebSocket readyState in onerror:', ws.readyState);
        
        if (connectionHandled) {
          console.log('🔧 Connection already handled, skipping onerror');
          return;
        }
        connectionHandled = true;
        
        if (!isMountedRef.current) {
          console.log('🔧 Component not mounted, skipping onerror');
          return;
        }
        setIsConnected(false);
        setIsConnecting(false);
        hasAnnouncedConnectionRef.current = false;
        
        // Release connection lock on error
        connectionLockRef.current = false;
        console.log('🔓 CONNECTION LOCK RELEASED (error)');
        console.error('❌ WebSocket connection error:', error);
        console.error('❌ WebSocket connection error type:', error.constructor.name);
        console.error('❌ WebSocket connection error message:', error.message);
        console.error('❌ WebSocket connection error code:', error.code);
        
        // Only show error notification if this isn't a quick retry
        if (reconnectAttempts > 2) {
          // Try to get more detailed error information
          let errorMessage = 'Unknown error';
          if (error.message) {
            errorMessage = error.message;
          } else if (error.constructor.name !== 'Event') {
            errorMessage = error.constructor.name;
          }
          
          addNotification({
            type: 'error',
            title: 'Connection Error',
            message: `Failed to connect to Akash Share Group Chat: ${errorMessage}`
          });
        }
        
        // DISABLED: Auto-reconnection to prevent loops
        // setTimeout(() => {
        //   if (isMountedRef.current && username && !isConnecting && reconnectAttempts < maxReconnectAttempts) {
        //     console.log('🔁 General Chat: Attempting to reconnect after error...');
        //     setReconnectAttempts(prev => prev + 1);
        //     connectToChat();
        //   }
        // }, 5000);
      };

      ws.onclose = () => {
        console.log('🔧 WebSocket onclose event triggered');
        console.log('🔧 WebSocket readyState in onclose:', ws.readyState);
        
        if (connectionHandled) {
          console.log('🔧 Connection already handled, skipping onclose');
          return;
        }
        connectionHandled = true;
        
        if (!isMountedRef.current) {
          console.log('🔧 Component not mounted, skipping onclose');
          return;
        }
        const wasConnected = isConnected;
        setIsConnected(false);
        setIsConnecting(false);
        hasAnnouncedConnectionRef.current = false;
        
        // Release connection lock on close
        connectionLockRef.current = false;
        console.log('🔓 CONNECTION LOCK RELEASED (close)');
        if (!wasConnected) {
          setReconnectAttempts(prev => prev + 1); // Increment reconnect attempts only if we weren't connected
        }
        console.log('🔌 WebSocket connection closed');
        
        // Only show notification if we were actually connected
        if (wasConnected) {
          addNotification({
            type: 'warning',
            title: 'Disconnected',
            message: 'Lost connection to group chat'
          });
        }
        
        // Auto-reconnect after 3 seconds if component is still mounted and not already connecting
        // DISABLED: Auto-reconnection to prevent loops
        // if (wasConnected) {
        //   setTimeout(() => {
        //     if (isMountedRef.current && username && !isConnecting && reconnectAttempts < maxReconnectAttempts) {
        //       console.log('🔁 General Chat: Attempting to reconnect...');
        //       setReconnectAttempts(prev => prev + 1);
        //       connectToChat();
        //     }
        //   }, 3000);
        // }
      };

      wsRef.current = ws;
      
      // Connection timeout fallback - reduced to 5 seconds for faster feedback
      const timeoutId = setTimeout(() => {
        if (!connectionHandled && ws.readyState === WebSocket.CONNECTING) {
          connectionHandled = true;
          console.error('❌ WebSocket connection timeout after 5 seconds');
          setIsConnecting(false);
          setIsConnected(false);
          hasAnnouncedConnectionRef.current = false;
          
          // Release connection lock on timeout
          connectionLockRef.current = false;
          console.log('🔓 CONNECTION LOCK RELEASED (timeout)');
          ws.close();
          
          // Don't show timeout error on first attempt
          if (reconnectAttempts > 0) {
            addNotification({
              type: 'error',
              title: 'Connection Timeout',
              message: 'Connection to Akash Share Group Chat timed out'
            });
          }
          
          // Try to reconnect immediately for first few attempts
          // DISABLED: Auto-reconnection to prevent loops
          // if (reconnectAttempts < 3) {
          //   setTimeout(() => {
          //     if (isMountedRef.current && username && !isConnecting && reconnectAttempts < maxReconnectAttempts) {
          //       console.log('🔁 Akash Share Group Chat: Quick reconnect attempt...');
          //       setReconnectAttempts(prev => prev + 1);
          //       connectToChat();
          //     }
          //   }, 1000); // Quick retry for first attempts
          // }
        }
      }, 5000);
      
      // Clear timeout on successful connection
      ws.addEventListener('open', () => clearTimeout(timeoutId));
      ws.addEventListener('error', () => clearTimeout(timeoutId));
      ws.addEventListener('close', () => clearTimeout(timeoutId));
      
    } catch (error) {
      setIsConnecting(false);
      setIsConnected(false);
      setReconnectAttempts(prev => prev + 1); // Increment reconnect attempts
      hasAnnouncedConnectionRef.current = false;
      
      // Release connection lock on exception
      connectionLockRef.current = false;
      console.log('🔓 CONNECTION LOCK RELEASED (exception)');
      console.error('❌ Failed to create WebSocket connection:', error);
      
      // Try to get more detailed error information
      let errorMessage = 'Unknown error';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.constructor.name !== 'Error') {
        errorMessage = error.constructor.name;
      }
      
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: `Failed to establish connection to group chat: ${errorMessage}`
      });
      
      // DISABLED: Auto-reconnection to prevent loops
      // setTimeout(() => {
      //   if (isMountedRef.current && username && !isConnecting && reconnectAttempts < maxReconnectAttempts) {
      //     console.log('🔁 General Chat: Attempting to reconnect after exception...');
      //     setReconnectAttempts(prev => prev + 1);
      //     connectToChat();
      //   }
      // }, 5000);
    }
  }, [username, currentRoom, isConnecting, isConnected, addNotification, addNotificationMessage, reconnectAttempts, maxReconnectAttempts]);

  // Send text message
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !isConnected || !wsRef.current) return;

    const messageData = {
      type: 'message',
      message: newMessage.trim(),
      room: currentRoom,
      timestamp: new Date().toISOString()
    };

    // Add to local messages immediately (optimistic update)
    const localMessage = {
      id: Date.now() + Math.random(),
      content: newMessage.trim(),
      username,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sending'
    };
    
    setMessages(prev => [...prev, localMessage]);
    
    try {
      wsRef.current.send(JSON.stringify(messageData));
      // Update message status to sent
      setMessages(prev => prev.map(msg => 
        msg.id === localMessage.id ? { ...msg, status: 'sent' } : msg
      ));
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Update message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === localMessage.id ? { ...msg, status: 'failed' } : msg
      ));
      addNotification({
        type: 'error',
        title: 'Send Failed',
        message: 'Failed to send message'
      });
    }
    
    setNewMessage('');
  }, [newMessage, isConnected, currentRoom, username, addNotification]);

  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      addNotification({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select an image file'
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      addNotification({
        type: 'error',
        title: 'File Too Large',
        message: 'Image must be smaller than 5MB'
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setShowImageModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Send image message
  const sendImage = useCallback(() => {
    if (!selectedImage || !isConnected || !wsRef.current) return;

    // For demo purposes, we'll use the image preview as URL
    // In a real app, you'd upload to a server first
    const imageData = {
      type: 'image',
      imageUrl: imagePreview,
      caption: imageCaption.trim(),
      room: currentRoom,
      timestamp: new Date().toISOString()
    };

    // Add to local messages immediately
    const localMessage = {
      id: Date.now() + Math.random(),
      imageUrl: imagePreview,
      caption: imageCaption.trim(),
      username,
      timestamp: new Date().toISOString(),
      type: 'image',
      status: 'sent'
    };
    
    setMessages(prev => [...prev, localMessage]);
    wsRef.current.send(JSON.stringify(imageData));
    
    // Reset image state
    setSelectedImage(null);
    setImagePreview(null);
    setImageCaption('');
    setShowImageModal(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedImage, imagePreview, imageCaption, isConnected, currentRoom, username]);

  // Handle Enter key press
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Reset connection state when component mounts
  // CONSOLIDATED EFFECT: Handle both mount/unmount and username connection
  // We intentionally depend only on username to avoid reconnection loops caused by
  // changing function identities. The connection routine is accessed via refs.
  useEffect(() => {
    console.log('🔧 Akash Share Group Chat effect running - username:', username);
    isMountedRef.current = true;
    
    // Capture refs at effect start to avoid lint warnings in cleanup
    const notificationCache = notificationCacheRef.current;
    const lastNotificationTime = lastNotificationTimeRef.current;
    
    // Reset states
    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
    
    let connectTimer = null;
    
    // Connect if we have a username
    if (username && username.trim()) {
      console.log('🔧 Starting connection for username:', username);
      console.log('🔧 Initial connection state - isConnected:', false, 'isConnecting:', false);
      
      connectTimer = setTimeout(() => {
        if (isMountedRef.current && username) {
          console.log('🔧 Attempting connection...');
          console.log('🔧 Pre-connection state - isConnected:', isConnected, 'isConnecting:', isConnecting);
          connectToChat();
        }
      }, 500); // Increased delay to ensure state is stable
    }
    
    // Cleanup function
    return () => {
      console.log('🔧 Akash Share Group Chat cleanup running');
      isMountedRef.current = false;
      
      // Reset all connection states
      setIsConnected(false);
      setIsConnecting(false);
      hasAnnouncedConnectionRef.current = false;
      connectionLockRef.current = false;
      
      if (connectTimer) {
        clearTimeout(connectTimer);
      }
      
      if (wsRef.current) {
        console.log('🔧 Closing WebSocket in cleanup');
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Clear notification caches using captured refs
      if (notificationCache) notificationCache.clear();
      if (lastNotificationTime) lastNotificationTime.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]); // Only depend on username to prevent loops

  // Clear everything when app closes/page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔧 handleBeforeUnload called - clearing data');
      // Clear all temporary data
      setMessages([]);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      console.log('🔧 Removing beforeunload listener');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Also clear on component unmount
    };
  }, []);

  return (
    <div 
      className="flex flex-col h-screen"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #121212 50%, #1C1C1C 100%)'
      }}
    >
      {/* Header with connection status and member count - redesigned with black theme */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-800"
        style={{
          background: 'linear-gradient(90deg, rgba(18, 18, 18, 0.9), rgba(31, 31, 31, 0.9))'
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <h2 className="text-lg font-bold text-white">🎓 {roomInfo.name}</h2>
            <p className="text-sm text-gray-300">
              {isConnected ? (
                `${roomInfo.memberCount} members online`
              ) : isConnecting ? (
                'Connecting...'
              ) : (
                'Disconnected'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isConnected ? 'bg-green-900/20 text-green-300 border border-green-700/30' :
            isConnecting ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-700/30' :
            'bg-red-900/20 text-red-300 border border-red-700/30'
          }`}>
            {isConnected ? '🟢 Online' : isConnecting ? '🟡 Connecting' : '🔴 Offline'}
          </div>
          {onlineMembers.length > 0 && (
            <div className="text-xs text-gray-300">
              👥 {onlineMembers.slice(0, 3).join(', ')}{onlineMembers.length > 3 ? '...' : ''}
            </div>
          )}
          {!isConnected && !isConnecting && username && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setReconnectAttempts(0);
                  setNotifications([]);
                  connectToChat();
                }}
                className="px-3 py-1 text-xs font-medium text-white transition-all bg-gray-800 rounded-full hover:bg-gray-700"
              >
                🔄 Reconnect
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={() => setNotifications([])}
                  className="px-2 py-1 text-xs font-medium text-white transition-all bg-red-800 rounded-full hover:bg-red-700"
                >
                  ✕ Clear Errors
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 p-4 space-y-2 overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(18, 18, 18, 0.9) 0%, rgba(28, 28, 28, 0.9) 100%)'
        }}
      >
        <AnimatePresence>
          {/* Show notifications */}
          {notifications.map((notification) => (
            <NotificationMessage
              key={notification.id}
              notification={notification}
            />
          ))}
          
            {messages.length === 0 ? (
              <div className="mt-8 text-center text-gray-400">
                <Users size={48} className="mx-auto mb-4 text-gray-500" />
                {isConnected ? (
                  <>
                    <p>Welcome to Akash Share Group Chat! 🎓</p>
                    <p className="mt-2 text-sm">Start chatting with your classmates!</p>
                  </>
                ) : isConnecting ? (
                  <>
                    <p>Connecting to Akash Share Group Chat...</p>
                    <div className="inline-block w-4 h-4 mt-2 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
                  </>
                ) : (
                  <>
                    <p>Disconnected from Akash Share Group Chat</p>
                    <p className="mt-2 text-sm">Click the Reconnect button above</p>
                  </>
                )}
              </div>
            ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.username === username}
              />
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area (WhatsApp style) */}
      <div 
        className="p-4 border-t border-gray-800"
        style={{
          background: 'linear-gradient(90deg, rgba(18, 18, 18, 0.95), rgba(28, 28, 28, 0.95))'
        }}
      >
        <div className="flex items-end space-x-3">
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 transition-colors rounded-full"
            style={{
              background: 'rgba(31, 41, 55, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(31, 41, 55, 0.3)';
              e.target.style.color = 'rgba(156, 163, 175, 1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(31, 41, 55, 0.1)';
              e.target.style.color = 'rgb(156, 163, 175)';
            }}
            title="Attach image"
          >
            <Paperclip size={20} />
          </button>

          {/* Message input */}
          <div 
            className="flex items-center flex-1 px-4 py-2 space-x-2 rounded-full"
            style={{
              background: 'linear-gradient(90deg, rgba(28, 28, 28, 0.8), rgba(18, 18, 18, 0.8))',
              border: '1px solid rgba(55, 65, 81, 0.3)'
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type a message in Akash Share Group Chat..." : isConnecting ? "Connecting..." : "Disconnected - Please rejoin"}
                disabled={!isConnected}
                className="flex-1 text-white placeholder-gray-400 bg-transparent outline-none"
                onFocus={() => console.log('🔧 Input focused - isConnected:', isConnected, 'disabled:', !isConnected)}
            />
            <button 
              className="p-1 text-gray-400 transition-colors rounded"
              onMouseEnter={(e) => {
                e.target.style.color = 'rgba(156, 163, 175, 1)';
                e.target.style.background = 'rgba(31, 41, 55, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgb(156, 163, 175)';
                e.target.style.background = 'transparent';
              }}
            >
              <Smile size={18} />
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="p-2 text-white transition-colors rounded-full"
            style={newMessage.trim() && isConnected
              ? {
                  background: 'linear-gradient(45deg, rgba(31, 41, 55, 0.8), rgba(18, 18, 18, 0.8))',
                  boxShadow: '0 0 15px rgba(31, 41, 55, 0.4)',
                  border: '1px solid rgba(55, 65, 81, 0.3)'
                }
              : {
                  background: 'rgba(55, 65, 81, 0.5)',
                  color: 'rgba(156, 163, 175, 0.8)',
                  cursor: 'not-allowed'
                }
            }
          >
            <Send size={20} />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 mx-4 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, rgba(18, 18, 18, 0.95), rgba(28, 28, 28, 0.95))',
              border: '1px solid rgba(55, 65, 81, 0.3)',
              boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)'
            }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Send Image</h3>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setImageCaption('');
                  }}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ×
                </button>
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover w-full h-48 rounded-lg"
                  />
                </div>
              )}

              {/* Caption input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full p-2 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                  style={{
                    background: 'linear-gradient(90deg, rgba(28, 28, 28, 0.8), rgba(18, 18, 18, 0.8))',
                    border: '1px solid rgba(55, 65, 81, 0.3)'
                  }}
                />
              </div>

              {/* Send button */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setImageCaption('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={sendImage}
                  disabled={!isConnected}
                  className="px-6 py-2 text-white transition-all rounded-lg"
                  style={isConnected
                    ? {
                        background: 'linear-gradient(45deg, rgba(31, 41, 55, 0.8), rgba(18, 18, 18, 0.8))',
                        boxShadow: '0 0 15px rgba(31, 41, 55, 0.4)',
                        border: '1px solid rgba(55, 65, 81, 0.3)'
                      }
                    : {
                        background: 'rgba(55, 65, 81, 0.5)',
                        color: 'rgba(156, 163, 175, 0.8)',
                        cursor: 'not-allowed'
                      }
                  }
                >
                  Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name Input Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-8 mx-4 rounded-lg"
              style={{
                background: 'linear-gradient(180deg, rgba(18, 18, 18, 0.95), rgba(28, 28, 28, 0.95))',
                border: '1px solid rgba(55, 65, 81, 0.3)',
                boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 text-center">
                <Users size={48} className="mx-auto mb-4 text-gray-400" />
                <h2 className="mb-2 text-2xl font-bold text-white">Join Group Chat</h2>
                <p className="text-gray-300">Enter your name to start chatting</p>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  onKeyPress={handleNameKeyPress}
                  placeholder="Your name..."
                  autoFocus
                  className="w-full p-3 text-center text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                  style={{
                    background: 'linear-gradient(90deg, rgba(28, 28, 28, 0.8), rgba(18, 18, 18, 0.8))',
                    border: '1px solid rgba(55, 65, 81, 0.3)'
                  }}
                />
              </div>

              <button
                onClick={handleJoinChat}
                disabled={!tempUsername.trim()}
                className="w-full py-3 font-medium text-white transition-all rounded-lg"
                style={tempUsername.trim()
                  ? {
                      background: 'linear-gradient(45deg, rgba(31, 41, 55, 0.8), rgba(18, 18, 18, 0.8))',
                      boxShadow: '0 0 15px rgba(31, 41, 55, 0.4)',
                      border: '1px solid rgba(55, 65, 81, 0.3)'
                    }
                  : {
                      background: 'rgba(55, 65, 81, 0.5)',
                      color: 'rgba(156, 163, 175, 0.8)',
                      cursor: 'not-allowed'
                    }
                }
              >
                Join Chat
              </button>

              <p className="mt-4 text-xs text-center text-gray-400">
                Press Enter to join quickly
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection status */}
      {!isConnected && username && !showNameModal && (
        <div className="absolute px-4 py-2 text-white transform -translate-x-1/2 bg-red-900 rounded-lg shadow-lg top-16 left-1/2">
          {isConnecting ? 'Connecting...' : 'Disconnected'}
        </div>
      )}
    </div>
  );
};

export default GroupChatWhatsApp;