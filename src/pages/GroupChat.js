import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Users, 
  MessageCircle, 
  Hash,
  User,
  Clock,
  Circle,
  Wifi,
  WifiOff
} from 'lucide-react';
import useStore from '../store/useStore';
import environment from '../config/environment';
import { sanitizeString } from '../lib/utils';

// Format time for chat messages
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const GroupChat = () => {
  const { addNotification } = useStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username] = useState(`User${Math.floor(Math.random() * 10000)}`);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const rooms = [
    { id: 'general', name: 'General', icon: Hash },
    { id: 'help', name: 'Help & Support', icon: MessageCircle },
    { id: 'announcements', name: 'Announcements', icon: Users }
  ];

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-connect when component mounts
  useEffect(() => {
    connectToChat();
    
    return () => {
      console.log('🧹 GroupChat component unmount - cleaning up');
      isMountedRef.current = false;
      
      // Clear all timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Close WebSocket connection
      if (wsRef.current) {
        console.log('🧹 Closing WebSocket connection');
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close(1000, 'Component unmounting');
        }
        
        wsRef.current = null;
      }
    };
  }, [connectToChat]);

  const connectToChat = useCallback(() => {
    // Check if component is still mounted
    if (!isMountedRef.current) {
      console.log('🚫 Component unmounted, aborting connection');
      return;
    }
    
    // Prevent multiple simultaneous connection attempts
    if (isConnecting || (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('🚫 Connection already in progress, skipping');
      return;
    }
    
    // Set connecting state
    setIsConnecting(true);
    
    try {
      // Clear any existing timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      // Close existing connection if any
      if (wsRef.current) {
        console.log('🔌 Closing existing WebSocket connection');
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      
      console.log('🔌 Starting fresh connection attempt');
      
      // Use environment configuration for WebSocket URL
      const wsUrl = environment.getWebSocketUrl(sanitizeString(username, 50), currentRoom);
      console.log('🔗 Connecting to:', wsUrl);
      
      // Add additional debugging for Electron environment
      console.log('📍 Environment info:', {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        apiUrl: environment.apiUrl,
        isProduction: environment.isProduction,
        baseApiUrl: environment.baseApiUrl
      });
      
      // Additional debugging for WebSocket connection
      console.log('🔧 WebSocket connection details:', {
        username: sanitizeString(username, 50),
        room: currentRoom,
        timestamp: new Date().toISOString()
      });
      
      // Test if WebSocket constructor is available
      if (typeof WebSocket === 'undefined') {
        console.error('❌ WebSocket constructor is not available');
        addNotification({
          type: 'error',
          title: 'Connection Failed',
          message: 'WebSocket support is not available in this environment.'
        });
        setIsConnecting(false);
        return;
      }
      
      // Test URL format
      try {
        new URL(wsUrl);
      } catch (urlError) {
        console.error('❌ Invalid WebSocket URL:', wsUrl, urlError);
        addNotification({
          type: 'error',
          title: 'Connection Failed',
          message: `Invalid WebSocket URL: ${wsUrl}`
        });
        setIsConnecting(false);
        return;
      }
      
      wsRef.current = new WebSocket(wsUrl);
      
      // Set a reasonable connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
          console.log('⏰ Connection timeout');
          wsRef.current.close();
          setIsConnecting(false);
          setIsConnected(false);
          addNotification({
            type: 'error',
            title: 'Connection Timeout',
            message: 'Could not connect to chat server. Please check if the backend is running on port 5002 and try again.'
          });
        }
      }, 10000);
      
      wsRef.current.onopen = () => {
        if (!isMountedRef.current) return;
        
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        console.log('✅ WebSocket connected successfully');
        setIsConnecting(false);
        setIsConnected(true);
        addNotification({
          type: 'success',
          title: 'Connected!',
          message: 'Successfully connected to group chat'
        });
      };
      
      wsRef.current.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received:', data.type, data);
          
          switch (data.type) {
            case 'message':
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                username: sanitizeString(data.username, 50),
                message: sanitizeString(data.message, 500),
                timestamp: new Date(data.timestamp),
                room: data.room
              }]);
              break;
              
            case 'userJoined':
              setOnlineUsers(data.users || []);
              break;
              
            case 'userLeft':
              setOnlineUsers(data.users || []);
              break;
              
            case 'userList':
              setOnlineUsers(data.users || []);
              break;
              
            default:
              console.log('❓ Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('💥 Message parsing error:', error, 'Data:', event.data);
        }
      };
      
      wsRef.current.onclose = (event) => {
        if (!isMountedRef.current) return;
        
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        console.log('🔌 WebSocket closed, code:', event.code, 'reason:', event.reason);
        setIsConnecting(false);
        setIsConnected(false);
        
        // Only notify if it was an unexpected close
        if (event.code !== 1000) {
          addNotification({
            type: 'warning',
            title: 'Disconnected',
            message: 'Connection to chat server was lost. Reconnecting...'
          });
          
          // Auto-reconnect with delay
          if (isMountedRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current && !isConnecting && !isConnected) {
                console.log('🔄 Auto-reconnecting to chat server...');
                connectToChat();
              }
            }, 3000);
          }
        }
      };
      
      wsRef.current.onerror = (error) => {
        if (!isMountedRef.current) return;
        
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        console.error('🚨 WebSocket error:', error);
        console.error('🚨 WebSocket error details:', {
          message: error.message,
          code: error.code,
          reason: error.reason,
          target: error.target,
          type: error.type
        });
        setIsConnecting(false);
        setIsConnected(false);
        
        // Provide more specific error messages based on the error type
        let errorMessage = 'Failed to connect to chat server. Please check if the backend is running on port 5002 and try again.';
        
        if (error && error.message) {
          if (error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Connection refused. Please ensure the backend server is running on port 5002.';
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'Server not found. Please check if the backend server is running on port 5002.';
          } else if (error.message.includes('ECONNRESET')) {
            errorMessage = 'Connection reset. The server may have restarted. Please try again.';
          }
        }
        
        // Add additional context for Electron environment
        if (window.location.protocol === 'file:') {
          errorMessage += ' Note: In the desktop app, the backend should start automatically. If this error persists, try restarting the application.';
        }
        
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: errorMessage
        });
      };
      
    } catch (error) {
      console.error('💥 Connection setup failed:', error);
      console.error('💥 Connection setup error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setIsConnecting(false);
      setIsConnected(false);
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: `Could not setup WebSocket connection: ${error.message}`
      });
    }
  }, [username, currentRoom, addNotification, isConnecting, isConnected]);

  const leaveChat = () => {
    // Clear all timeouts
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close WebSocket connection properly
    if (wsRef.current) {
      console.log('🔌 Closing WebSocket connection on leave');
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'User left chat');
      }
      
      wsRef.current = null;
    }
    
    // Reset state
    setIsConnected(false);
    setIsConnecting(false);
    setMessages([]);
    setOnlineUsers([]);
  };

  const reconnectToChat = () => {
    // Prevent reconnection if already connected or connecting
    if (isConnected || isConnecting || (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('🚫 Reconnect blocked - already connected or connecting');
      return;
    }
    
    console.log('🔄 Attempting to reconnect...');
    connectToChat();
  };

  // Handle room switching
  const switchRoom = (roomId) => {
    if (currentRoom === roomId) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send room switch message
      wsRef.current.send(JSON.stringify({
        type: 'switchRoom',
        room: roomId
      }));
    }
    
    setCurrentRoom(roomId);
    setMessages([]); // Clear messages when switching rooms
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      if (!isConnected) {
        addNotification({
          type: 'warning',
          title: 'Not Connected',
          message: 'Please connect to chat before sending messages'
        });
      }
      return;
    }
    
    const message = sanitizeString(newMessage, 500);
    if (!message) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'message',
      message,
      room: currentRoom
    }));
    
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="mb-2 text-3xl font-bold gradient-text">Group Chat</h1>
        <div className="flex items-center justify-center space-x-4 text-foreground/70">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : isConnecting ? (
              <div className="w-4 h-4 border-2 rounded-full border-akash-400 border-t-transparent animate-spin"></div>
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span>{isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}</span>
            <span>•</span>
            <span>{onlineUsers.length} online</span>
          </div>
          <div className="flex space-x-2">
            {!isConnected && !isConnecting && (
              <motion.button
                onClick={reconnectToChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-blue-400 underline hover:text-blue-300"
              >
                Reconnect
              </motion.button>
            )}
            <motion.button
              onClick={leaveChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-red-400 underline hover:text-red-300"
            >
              Leave Chat
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid flex-1 min-h-0 grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 lg:col-span-1"
        >
          {/* Rooms */}
          <div className="p-4 border rounded-lg bg-card border-border">
            <h3 className="flex items-center mb-3 font-semibold text-foreground">
              <Hash className="w-4 h-4 mr-2 text-white" />
              Rooms
            </h3>
            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => switchRoom(room.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentRoom === room.id
                      ? 'bg-akash-400/20 text-akash-400'
                      : 'text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
                  }`}
                >
                  <room.icon className="inline w-4 h-4 mr-2 text-white" />
                  {room.name}
                </button>
              ))}
            </div>
          </div>

          {/* Online Users */}
          <div className="p-4 border rounded-lg bg-card border-border">
            <h3 className="flex items-center mb-3 font-semibold text-foreground">
              <Users className="w-4 h-4 mr-2 text-white" />
              Online ({onlineUsers.length})
            </h3>
            <div className="space-y-2">
              {onlineUsers.map((user, _index) => (
                <div key={_index} className="flex items-center space-x-2 text-foreground/70">
                  <Circle className="w-2 h-2 text-green-400 fill-current" />
                  <span className="text-sm">{user}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col border rounded-lg lg:col-span-3 bg-card border-border"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-foreground/10">
            <h2 className="flex items-center font-semibold text-foreground">
              {rooms.find(r => r.id === currentRoom)?.icon && 
                React.createElement(rooms.find(r => r.id === currentRoom).icon, { className: "w-5 h-5 mr-2 text-white" })
              }
              {rooms.find(r => r.id === currentRoom)?.name}
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <AnimatePresence>
              {messages.length === 0 ? (
                <div className="py-8 text-center text-foreground/50">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-white opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                  {!isConnected && !isConnecting && (
                    <motion.button
                      onClick={reconnectToChat}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 mt-4 rounded-lg btn-primary"
                    >
                      Connect to Chat
                    </motion.button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.username === username ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.username === username
                          ? 'bg-akash-500 text-foreground'
                          : 'bg-foreground/10 text-foreground'
                      }`}>
                        {message.username !== username && (
                          <div className="flex items-center mb-1 space-x-2">
                            <User className="w-3 h-3 text-akash-400" />
                            <span className="text-xs font-medium text-akash-400">{message.username}</span>
                          </div>
                        )}
                        <p className="break-words">{message.message}</p>
                        <div className="flex items-center justify-end mt-1">
                          <Clock className="w-3 h-3 mr-1 opacity-50" />
                          <span className="text-xs opacity-50">{formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-foreground/10">
            {!isConnected && !isConnecting && (
              <div className="p-3 mb-3 border rounded-lg bg-yellow-500/20 border-yellow-500/30">
                <p className="mb-2 text-sm text-yellow-400">⚠️ Not connected to chat server</p>
                <motion.button
                  onClick={reconnectToChat}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-1 text-sm btn-primary"
                >
                  Connect to Chat
                </motion.button>
              </div>
            )}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type your message..." : "Connect to chat to send messages..."}
                className="flex-1 px-4 py-2 border rounded-lg bg-foreground/10 border-foreground/20 text-foreground placeholder-foreground/50 focus:outline-none focus:border-akash-400"
                maxLength={500}
                disabled={!isConnected}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                whileHover={{ scale: isConnected ? 1.05 : 1 }}
                whileTap={{ scale: isConnected ? 0.95 : 1 }}
                className="px-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
            {!isConnected && (
              <p className="mt-2 text-xs text-foreground/50">
                💡 Tip: You can type your message, but you need to connect to send it
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GroupChat;