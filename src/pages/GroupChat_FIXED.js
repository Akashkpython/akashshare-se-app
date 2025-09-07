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
import useStore from '../store/useStore.js';
import { environment } from '../config/environment.js';
import { sanitizeString } from '../lib/utils.js';

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
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const isMountedRef = useRef(true);
  const visibilityChangeListenerRef = useRef(null);

  // Define connectToChat function first to avoid hoisting issues
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

    // If already connected, don't reconnect unless forced
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('✅ Already connected to WebSocket server');
      setIsConnected(true);
      setIsConnecting(false);
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
        // Remove event listeners to prevent memory leaks
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        
        // Only close if the connection is open or connecting
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          try {
            wsRef.current.close();
            console.log('🔌 Existing WebSocket connection closed');
          } catch (closeError) {
            console.warn('⚠️ Error closing existing WebSocket:', closeError);
          }
        }
        wsRef.current = null;
      }

      // Get WebSocket URL from environment configuration
      const wsUrl = environment.getWebSocketUrl(username, currentRoom);
      console.log('🔗 Connecting to WebSocket:', wsUrl);
      
      // Create new WebSocket connection
      wsRef.current = new WebSocket(wsUrl);
      
      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
          console.error('⏰ WebSocket connection timeout');
          wsRef.current.close();
          setIsConnecting(false);
          setIsConnected(false);
          addNotification({
            type: 'error',
            title: 'Connection Timeout',
            message: 'Failed to connect to chat server. Please check your connection and try again.'
          });
        }
      }, 10000); // 10 second timeout

      // Handle connection open
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connection established');
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0); // Reset reconnect attempts on successful connection
        
        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        addNotification({
          type: 'success',
          title: 'Connected to Chat',
          message: `Successfully connected to ${currentRoom} room`
        });
      };

      // Handle incoming messages
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received message:', data);
          
          switch (data.type) {
            case 'userList':
              setOnlineUsers(data.users || []);
              break;
              
            case 'message':
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                username: data.username,
                message: data.message,
                timestamp: data.timestamp || new Date().toISOString(),
                type: 'message'
              }]);
              break;
              
            case 'userJoined':
              setOnlineUsers(data.users || []);
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                username: 'System',
                message: `${data.username} joined the chat`,
                timestamp: data.timestamp || new Date().toISOString(),
                type: 'system'
              }]);
              break;
              
            case 'userLeft':
              setOnlineUsers(data.users || []);
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                username: 'System',
                message: `${data.username} left the chat`,
                timestamp: data.timestamp || new Date().toISOString(),
                type: 'system'
              }]);
              break;
              
            case 'roomSwitched':
              setOnlineUsers(data.users || []);
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                username: 'System',
                message: `Switched to ${data.room} room`,
                timestamp: data.timestamp || new Date().toISOString(),
                type: 'system'
              }]);
              addNotification({
                type: 'success',
                title: 'Room Switched',
                message: `Successfully switched to ${data.room} room`
              });
              break;
              
            case 'error':
              console.error('❌ Server error:', data.message);
              addNotification({
                type: 'error',
                title: 'Chat Error',
                message: data.message || 'An error occurred in the chat'
              });
              break;
              
            default:
              console.log('📨 Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      // Handle connection close
      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        // Clear reconnect timeout if it exists
        if (reconnectTimeoutRef && reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        // Determine if we should attempt to reconnect
        const shouldReconnect = event.code !== 1000 && // Not normal closure
                               event.code !== 1001 && // Not going away
                               reconnectAttempts < 10 && // Haven't exceeded max attempts
                               isMountedRef.current; // Component is still mounted
        
        if (shouldReconnect) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
          const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
          const totalDelay = delay + jitter;
          
          console.log(`🔄 Attempting to reconnect in ${Math.round(totalDelay)}ms (attempt ${reconnectAttempts + 1}/10)`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setReconnectAttempts(prev => prev + 1);
              connectToChat();
            }
          }, totalDelay);
          
          // Provide user feedback based on close code
          let errorMessage = 'Connection lost. Attempting to reconnect...';
          if (event.code === 1006) {
            errorMessage = 'Connection lost unexpectedly. Attempting to reconnect...';
          } else if (event.code === 1011) {
            errorMessage = 'Server error. Attempting to reconnect...';
          }
          
          addNotification({
            type: 'warning',
            title: 'Connection Lost',
            message: errorMessage
          });
        } else {
          // Max reconnection attempts reached or normal closure
          if (reconnectAttempts >= 10) {
            addNotification({
              type: 'error',
              title: 'Connection Failed',
              message: 'Unable to reconnect to chat server. Please refresh the page.'
            });
          } else if (event.code === 1000) {
            addNotification({
              type: 'info',
              title: 'Disconnected',
              message: 'Chat connection closed normally'
            });
          }
        }
      };

      // Handle connection errors
      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnecting(false);
        setIsConnected(false);
        
        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        // Provide user-friendly error messages
        let errorMessage = 'Failed to connect to chat server.';
        if (error.message) {
          if (error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Chat server is not running. Please start the backend server.';
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'Cannot find chat server. Please check your network connection.';
          } else if (error.message.includes('ETIMEDOUT')) {
            errorMessage = 'Connection to chat server timed out. Please try again.';
          }
        }
        
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: errorMessage
        });
      };

    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      setIsConnecting(false);
      setIsConnected(false);
      
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to create chat connection. Please try again.'
      });
    }
  }, [username, currentRoom, isConnecting, reconnectAttempts, addNotification]);

  // Add debugging to confirm we're using the React component
  useEffect(() => {
    console.log('💬 React GroupChat component loaded - This is the correct chat interface for the Electron app');
    console.log('📍 Current environment:', window.location.href);
    console.log('📍 Protocol:', window.location.protocol);
    
    // Add a notification to inform the user they're using the correct component
    addNotification({
      type: 'info',
      title: 'Correct Chat Interface',
      message: 'You are using the React GroupChat component (correct for Electron app), not the standalone HTML test page.'
    });
    
    // Also add a more prominent visual indicator
    console.log('%c✅ You are using the CORRECT React GroupChat component in the Electron app', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
    
    // Handle visibility change events (when window is hidden/shown)
    const handleVisibilityChange = () => {
      console.log('👁️ Document visibility changed:', document.visibilityState);
      if (document.visibilityState === 'visible') {
        // Window is now visible, check connection status
        console.log('👁️ Window became visible, checking connection status...');
        
        // If not connected and not connecting, attempt to reconnect
        if (!isConnected && !isConnecting) {
          console.log('🔄 Window became visible, attempting to reconnect to chat...');
          setTimeout(() => {
            if (isMountedRef.current) {
              connectToChat();
            }
          }, 1000); // Small delay to ensure component is fully ready
        } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // Connection is already open, just log it
          console.log('✅ Connection is already active');
        } else if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
          // Connection is in progress, just log it
          console.log('⏳ Connection is already in progress');
        }
      } else {
        // Window is hidden, keep connection alive but reduce activity
        console.log('🌙 Window is now hidden, keeping chat connection alive');
        
        // Don't close the connection, just reduce activity
        // The connection will remain open for when the window becomes visible again
      }
    };
    
    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityChangeListenerRef.current = handleVisibilityChange;
    
    return () => {
      // Clean up visibility change listener
      if (visibilityChangeListenerRef.current) {
        document.removeEventListener('visibilitychange', visibilityChangeListenerRef.current);
        visibilityChangeListenerRef.current = null;
      }
    };
  }, [addNotification, isConnected, isConnecting, connectToChat]);

  // Auto-connect when component mounts
  useEffect(() => {
    // Add a small delay to ensure component is fully mounted
    const connectTimer = setTimeout(() => {
      if (isMountedRef.current) {
        connectToChat();
      }
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
    };
  }, [connectToChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clear all timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (reconnectTimeoutRef && reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Switch room function
  const switchRoom = useCallback((newRoom) => {
    if (!newRoom || newRoom === currentRoom) return;
    
    console.log(`🔄 Switching from ${currentRoom} to ${newRoom}`);
    
    // Clear messages for the new room
    setMessages([]);
    
    // Update current room
    setCurrentRoom(newRoom);
    
    // If connected, send room switch message
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const switchMessage = {
        type: 'switchRoom',
        newRoom: newRoom,
        timestamp: new Date().toISOString()
      };
      
      try {
        wsRef.current.send(JSON.stringify(switchMessage));
        console.log('📤 Sent room switch message:', switchMessage);
      } catch (error) {
        console.error('❌ Error sending room switch message:', error);
      }
    } else {
      // If not connected, attempt to reconnect with new room
      console.log('🔄 Not connected, attempting to reconnect with new room');
      setTimeout(() => {
        if (isMountedRef.current) {
          connectToChat();
        }
      }, 500);
    }
  }, [currentRoom, connectToChat]);

  // Send message function
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const sanitizedMessage = sanitizeString(newMessage.trim());
    if (!sanitizedMessage) {
      addNotification({
        type: 'error',
        title: 'Invalid Message',
        message: 'Message contains invalid characters'
      });
      return;
    }

    const message = {
      type: 'message',
      message: sanitizedMessage,
      username: username,
      timestamp: new Date().toISOString()
    };

    try {
      wsRef.current.send(JSON.stringify(message));
      setNewMessage('');
      console.log('📤 Sent message:', message);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      addNotification({
        type: 'error',
        title: 'Send Failed',
        message: 'Failed to send message. Please try again.'
      });
    }
  }, [newMessage, username, addNotification]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Connection status indicator
  const getConnectionStatus = () => {
    if (isConnecting) {
      return { icon: Circle, text: 'Connecting...', color: 'text-yellow-500' };
    } else if (isConnected) {
      return { icon: Wifi, text: 'Connected', color: 'text-green-500' };
    } else {
      return { icon: WifiOff, text: 'Disconnected', color: 'text-red-500' };
    }
  };

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-akash-500/20 rounded-lg">
              <MessageCircle className="w-6 h-6 text-akash-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Group Chat</h1>
              <div className="flex items-center space-x-2 mt-1">
                <StatusIcon className={`w-4 h-4 ${connectionStatus.color}`} />
                <span className={`text-sm ${connectionStatus.color}`}>
                  {connectionStatus.text}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-400">Room: {currentRoom}</span>
              </div>
            </div>
          </div>
          
          {/* Room Selector */}
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <select
              value={currentRoom}
              onChange={(e) => switchRoom(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-akash-500"
            >
              <option value="general">General</option>
              <option value="help">Help</option>
              <option value="tech">Tech</option>
              <option value="random">Random</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.username === username ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'system' 
                      ? 'bg-gray-700 text-gray-300 text-center mx-auto'
                      : message.username === username
                        ? 'bg-akash-500 text-white'
                        : 'bg-gray-700 text-white'
                  }`}>
                    {message.type !== 'system' && (
                      <div className="text-xs opacity-75 mb-1">
                        {message.username}
                      </div>
                    )}
                    <div className="text-sm">{message.message}</div>
                    <div className="text-xs opacity-75 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0 p-6 border-t border-gray-700">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-akash-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !newMessage.trim()}
                className="px-6 py-3 bg-akash-500 hover:bg-akash-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Online Users Sidebar */}
        <div className="w-64 bg-gray-800/50 border-l border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-akash-400" />
            <h3 className="text-lg font-semibold text-white">Online Users</h3>
            <span className="bg-akash-500 text-white text-xs px-2 py-1 rounded-full">
              {onlineUsers.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {onlineUsers.map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-8 h-8 bg-akash-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm">{user}</span>
                {user === username && (
                  <span className="text-xs text-akash-400">(You)</span>
                )}
              </motion.div>
            ))}
          </div>
          
          {onlineUsers.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-8">
              No users online
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
