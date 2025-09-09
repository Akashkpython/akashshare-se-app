import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, AlertCircle, RefreshCw, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GroupChatSimple = () => {
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasConnectedRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simple notification system
  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Enhanced connection function with better error handling
  const connectToChat = () => {
    console.log('🚀 Akash Share Group Chat: Connecting with username:', username);
    
    // Prevent multiple connections
    if (hasConnectedRef.current || wsRef.current) {
      console.log('🚫 Akash Share Group Chat: Already connected or connecting');
      return;
    }

    if (!username || !isMountedRef.current) {
      console.log('❌ Akash Share Group Chat: No username or not mounted');
      return;
    }

    setIsConnecting(true);
    hasConnectedRef.current = true;
    
    // Use the correct port for WebSocket connection (5003 for backend)
    const wsUrl = `ws://localhost:5003/chat?username=${encodeURIComponent(username)}&room=general`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('✅ Akash Share Group Chat: Connected!');
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        addNotification({
          type: 'success',
          title: 'Connected',
          message: `Connected as ${username}`
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Akash Share Group Chat: Received:', data);
          
          if (data.type === 'message') {
            setMessages(prev => [...prev, {
              id: Date.now(),
              text: data.message,
              sender: data.username,
              timestamp: new Date().toLocaleTimeString(),
              isSent: data.username === username
            }]);
          } else if (data.type === 'userList') {
            setOnlineMembers(data.users || []);
          } else if (data.type === 'userJoined' || data.type === 'userLeft') {
            // Handle user join/leave notifications
            addNotification({
              type: 'info',
              title: data.type === 'userJoined' ? 'User Joined' : 'User Left',
              message: data.message
            });
          }
        } catch (error) {
          console.error('❌ Akash Share Group Chat: Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.log('❌ Akash Share Group Chat: Connection error', error);
        setIsConnected(false);
        setIsConnecting(false);
        hasConnectedRef.current = false;
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Failed to connect to the chat server. Make sure the backend is running on port 5003.'
        });
      };

      ws.onclose = () => {
        console.log('🔌 Akash Share Group Chat: Connection closed');
        setIsConnected(false);
        setIsConnecting(false);
        hasConnectedRef.current = false;
        wsRef.current = null;
        
        // Auto-reconnect logic
        if (isMountedRef.current && reconnectAttempts < 3) {
          setTimeout(() => {
            if (isMountedRef.current && username) {
              setReconnectAttempts(prev => prev + 1);
              connectToChat();
            }
          }, 2000);
        }
      };

    } catch (error) {
      console.error('❌ Akash Share Group Chat: Failed to create connection:', error);
      setIsConnecting(false);
      hasConnectedRef.current = false;
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: `Could not establish connection to chat server. Error: ${error.message}`
      });
    }
  };

  // Connect when username is set - ONLY ONCE
  useEffect(() => {
    if (username && !hasConnectedRef.current) {
      console.log('🔧 Akash Share Group Chat: Username set, connecting...');
      connectToChat();
    }
  }, [username]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Akash Share Group Chat: Cleaning up...');
      isMountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected || !wsRef.current) return;

    const messageData = {
      type: 'message',
      message: newMessage.trim(),
      username,
      room: 'general'
    };

    wsRef.current.send(JSON.stringify(messageData));
    setNewMessage('');
  };

  // Join chat handler
  const handleJoinChat = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      setShowNameModal(false);
    }
  };

  // Manual reconnect
  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setReconnectAttempts(0);
    setMessages([]);
    setOnlineMembers([]);
    hasConnectedRef.current = false;
    connectToChat();
  };

  // Handle key press for message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (showNameModal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 mx-4 bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl"
        >
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-700 to-gray-800">
              <Users size={32} className="text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              Join Group Chat
            </h2>
            <p className="text-gray-400">
              Connect with your classmates in real-time
            </p>
          </div>
          
          <div className="mb-6">
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinChat()}
              placeholder="Enter your name"
              className="w-full p-4 mb-4 text-white transition-all bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600"
              autoFocus
            />
            <button
              onClick={handleJoinChat}
              disabled={!tempUsername.trim()}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                tempUsername.trim()
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              Join Chat
            </button>
          </div>
          
          <div className="text-sm text-center text-gray-500">
            <p>Press Enter to join quickly</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen text-white bg-black">
      {/* Sidebar */}
      <div className="flex flex-col w-64 p-4 border-r border-gray-800 shadow-lg bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center p-3 mb-4 space-x-3 rounded-lg bg-gray-800/50">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-800">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold">Akash Share Group Chat</h2>
            <div className="flex items-center text-xs">
              {isConnected ? (
                <span className="flex items-center text-green-400">
                  <div className="w-2 h-2 mr-1 bg-green-400 rounded-full animate-pulse"></div>
                  Online
                </span>
              ) : isConnecting ? (
                <span className="flex items-center text-yellow-400">
                  <RefreshCw size={12} className="mr-1 animate-spin" />
                  Connecting
                </span>
              ) : (
                <span className="flex items-center text-red-400">
                  <AlertCircle size={12} className="mr-1" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-3 mb-4 rounded-lg bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Connected as</span>
            <span className="text-sm text-blue-400">{username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Members</span>
            <span className="flex items-center text-sm">
              <Users size={14} className="mr-1" />
              {onlineMembers.length} online
            </span>
          </div>
          {onlineMembers.length > 0 && (
            <div className="mt-2 text-xs">
              <div className="font-medium">Online members:</div>
              <div className="mt-1 text-gray-300">
                {onlineMembers.slice(0, 3).join(', ')}{onlineMembers.length > 3 ? '...' : ''}
              </div>
            </div>
          )}
        </div>
        
        {!isConnected && !isConnecting && (
          <button
            onClick={handleReconnect}
            className="flex items-center justify-center p-2 mb-4 text-sm transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            <RefreshCw size={16} className="mr-2" />
            Reconnect
          </button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-950">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-900 rounded-full">
                <Users size={32} className="text-gray-700" />
              </div>
              {isConnected ? (
                <>
                  <h3 className="mb-2 text-xl font-semibold text-gray-400">Welcome to Group Chat!</h3>
                  <p>Start a conversation with your classmates</p>
                </>
              ) : isConnecting ? (
                <>
                  <h3 className="mb-2 text-xl font-semibold text-gray-400">Connecting...</h3>
                  <p>Please wait while we establish the connection</p>
                </>
              ) : (
                <>
                  <h3 className="mb-2 text-xl font-semibold text-gray-400">Disconnected</h3>
                  <p>Click reconnect to join the chat again</p>
                </>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.isSent
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-br-none'
                      : 'bg-gray-800 text-white rounded-bl-none'
                  } shadow-lg`}
                >
                  {!message.isSent && (
                    <div className="mb-1 text-xs font-semibold text-gray-300">{message.sender}</div>
                  )}
                  <div className="text-sm">{message.text}</div>
                  <div className="mt-1 text-xs opacity-70">{message.timestamp}</div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type a message..." : isConnecting ? "Connecting..." : "Disconnected - Please reconnect"}
              disabled={!isConnected}
              className="flex-1 p-3 text-white transition-all bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:bg-gray-700 disabled:text-gray-500"
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !newMessage.trim()}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
                isConnected && newMessage.trim()
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed z-50 space-y-2 top-4 right-4">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-4 rounded-xl shadow-lg transition-all duration-300 flex items-start ${
                notification.type === 'success'
                  ? 'bg-green-900/90 text-white border border-green-700/50'
                  : notification.type === 'error'
                  ? 'bg-red-900/90 text-white border border-red-700/50'
                  : 'bg-yellow-900/90 text-white border border-yellow-700/50'
              }`}
            >
              <div className="flex-1">
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm opacity-90">{notification.message}</div>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="ml-2 text-white/70 hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroupChatSimple;