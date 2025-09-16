import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile,
  Users, 
  MoreVertical, 
  X, 
  Reply,
  MoreHorizontal,
  Sparkles,
  Settings,
  Bell,
  Crown
} from 'lucide-react';

// Modern emoji picker with black theme
const EmojiPicker = ({ onEmojiSelect, onClose, position = { x: 0, y: 0 } }) => {
  const emojiCategories = [
    { name: 'Recent', emojis: ['😀', '😂', '❤️', '👍', '😢', '😮'], icon: '⭐' },
    { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'], icon: '😊' },
    { name: 'People', emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'], icon: '👋' },
    { name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'], icon: '❤️' },
    { name: 'Objects', emojis: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍭', '🍬', '🍫', '🍩', '🍪', '🍯', '🍺', '🍻', '🥂', '🍷', '🍸', '🍹'], icon: '🎉' }
  ];

  const [activeCategory, setActiveCategory] = useState('Recent');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      className="absolute z-50 bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl border border-gray-800 p-6"
      style={{
        left: position.x,
        top: position.y - 320,
        width: '340px',
        height: '300px'
      }}
    >
      {/* Header with black theme */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-lg font-bold text-white">Reactions</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={18} className="text-gray-300" />
        </button>
          </div>

      {/* Category tabs with black theme */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {emojiCategories.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeCategory === category.name
                ? 'bg-white text-black shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Emoji grid with black theme */}
      <div className="grid grid-cols-8 gap-2 h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {emojiCategories
          .find(cat => cat.name === activeCategory)
          ?.emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => onEmojiSelect(emoji)}
              className="p-3 hover:bg-gray-800 rounded-xl transition-all duration-200 text-xl hover:scale-110 hover:shadow-lg"
            >
              {emoji}
            </button>
          ))}
      </div>
    </motion.div>
  );
};

// Message component with black theme
const ChatMessage = ({ message, onReaction, onReply, currentUser }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef(null);

  const isOwnMessage = message.username === currentUser;
  const isSystemMessage = message.type === 'system';
  const isFileShare = message.type === 'file_share';
  const reactions = message.reactions || {};

  const handleReactionClick = () => {
    const rect = messageRef.current.getBoundingClientRect();
    setEmojiPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji) => {
    onReaction(message.id, emoji);
    setShowEmojiPicker(false);
  };

  const handleFileDownload = () => {
    if (message.fileUrl) {
      const link = document.createElement('a');
      link.href = message.fileUrl;
      link.download = message.fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Special rendering for system messages
  if (isSystemMessage) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-gray-800/50 text-gray-300 px-4 py-2 rounded-full text-sm border border-gray-700/50">
          {message.content}
        </div>
      </div>
    );
  }

  // Special rendering for file share messages
  if (isFileShare) {
    const isImage = message.fileType?.startsWith('image/');
    const isVideo = message.fileType?.startsWith('video/');
    const isAudio = message.fileType?.startsWith('audio/');
    
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
        <div className={`relative max-w-xs lg:max-w-md`}>
          <div className={`relative px-5 py-3 rounded-3xl ${
            isOwnMessage
              ? 'bg-white text-black rounded-br-lg shadow-lg'
              : 'bg-gray-800 text-white rounded-bl-lg shadow-lg border border-gray-700'
          }`}>
            {/* File preview */}
            <div className="mb-3">
              {isImage ? (
                <img 
                  src={message.fileUrl} 
                  alt={message.fileName}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  onClick={handleFileDownload}
                />
              ) : isVideo ? (
                <video 
                  src={message.fileUrl} 
                  controls
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : isAudio ? (
                <audio 
                  src={message.fileUrl} 
                  controls
                  className="w-full"
                />
              ) : (
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-4xl mb-2">📄</div>
                  <div className="text-sm font-medium">{message.fileName}</div>
                </div>
              )}
            </div>
            
            {/* File info */}
            <div className="text-sm">
              <div className="font-medium mb-1">{message.fileName}</div>
              <div className="text-xs opacity-70">
                {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
              </div>
            </div>
            
            {/* Download button */}
            <button
              onClick={handleFileDownload}
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
            >
              💾 Save to PC
            </button>
            
            {/* Expiration notice */}
            {message.expiresAt && (
              <div className="text-xs opacity-50 mt-2 text-center">
                ⏰ Expires in 10 minutes
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messageRef}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      <div className={`relative max-w-xs lg:max-w-md`}>
        {/* Reply context with black theme */}
        {message.replyTo && (
          <div className={`mb-2 p-3 rounded-2xl bg-gray-800 border-l-4 ${
            isOwnMessage ? 'border-white' : 'border-gray-500'
          }`}>
            <div className="text-sm font-semibold text-gray-300">
              {message.replyTo.username}
            </div>
            <div className="text-sm text-gray-400 truncate">
              {message.replyTo.content}
            </div>
          </div>
        )}

        {/* Message bubble with black theme */}
        <div
          className={`relative px-5 py-3 rounded-3xl ${
            isOwnMessage
              ? 'bg-white text-black rounded-br-lg shadow-lg'
              : 'bg-gray-800 text-white rounded-bl-lg shadow-lg border border-gray-700'
          }`}
      >
        {/* Message content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Timestamp and status with black theme */}
          <div className={`flex items-center justify-end mt-2 space-x-2 ${
            isOwnMessage ? 'text-gray-600' : 'text-gray-400'
          }`}>
            <span className="text-xs font-medium">
              {formatTime(message.timestamp)}
            </span>
            {isOwnMessage && (
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Reactions with black theme */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(reactions).map(([emoji, users]) => (
              <div
                key={emoji}
                className="flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 shadow-lg border border-gray-700"
              >
                <span className="text-sm">{emoji}</span>
                <span className="text-xs text-gray-300 font-medium">{users.length}</span>
              </div>
            ))}
          </div>
        )}

        {/* Message actions with black theme */}
        <div className={`absolute top-0 ${
          isOwnMessage ? '-left-20' : '-right-20'
        } opacity-0 group-hover:opacity-100 transition-all duration-300`}>
          <div className="flex space-x-2">
            <button
              onClick={handleReactionClick}
              className="p-2 bg-gray-900 rounded-full shadow-xl hover:bg-gray-800 transition-all duration-200 hover:scale-110 border border-gray-800"
              title="React"
            >
              <Smile size={16} className="text-gray-300" />
            </button>
            <button
              onClick={() => onReply(message)}
              className="p-2 bg-gray-900 rounded-full shadow-xl hover:bg-gray-800 transition-all duration-200 hover:scale-110 border border-gray-800"
              title="Reply"
            >
              <Reply size={16} className="text-gray-300" />
            </button>
            <button className="p-2 bg-gray-900 rounded-full shadow-xl hover:bg-gray-800 transition-all duration-200 hover:scale-110 border border-gray-800">
              <MoreHorizontal size={16} className="text-gray-300" />
            </button>
          </div>
        </div>
        </div>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
            position={emojiPosition}
          />
        )}
      </AnimatePresence>
      </div>
  );
};

// Small sidebar component
const SmallSidebar = ({ 
  onlineMembers, 
  isAdmin, 
  onShowSettings, 
  onShowMembers, 
  onShowNotifications, 
  onShowAdminPanel,
  onShowEmojiPicker,
  isConnected 
}) => {
  return (
    <div className="w-16 bg-black border-r border-gray-900 flex flex-col items-center py-4 space-y-4 h-screen overflow-hidden">
      {/* Online Members */}
      <div className="relative group">
        <button 
          onClick={onShowMembers}
          className="p-3 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Users className="w-5 h-5 text-white" />
        </button>
        <div className="absolute left-full ml-2 top-0 bg-gray-900 rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="text-sm font-semibold text-white mb-2">Online Members</div>
          <div className="text-xs text-gray-300">{onlineMembers.length} online</div>
        </div>
      </div>

      {/* Emoji Picker */}
      <div className="relative group">
        <button 
          onClick={onShowEmojiPicker}
          className="p-3 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Smile className="w-5 h-5 text-white" />
        </button>
        <div className="absolute left-full ml-2 top-0 bg-gray-900 rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="text-sm font-semibold text-white">Emoji Picker</div>
      </div>
      </div>

      {/* Settings */}
      <div className="relative group">
        <button 
          onClick={onShowSettings}
          className="p-3 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
        <div className="absolute left-full ml-2 top-0 bg-gray-900 rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="text-sm font-semibold text-white">Settings</div>
        </div>
      </div>

      {/* Notifications */}
      <div className="relative group">
        <button 
          onClick={onShowNotifications}
          className="p-3 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Bell className="w-5 h-5 text-white" />
        </button>
        <div className="absolute left-full ml-2 top-0 bg-gray-900 rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="text-sm font-semibold text-white">Notifications</div>
        </div>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <div className="relative group">
          <button 
            onClick={onShowAdminPanel}
            className="p-3 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
          >
            <Crown className="w-5 h-5 text-yellow-400" />
          </button>
          <div className="absolute left-full ml-2 top-0 bg-gray-900 rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <div className="text-sm font-semibold text-white">Admin Panel</div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="relative group mt-auto">
        <div className="p-3 bg-gray-800 rounded-full">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
        <div className="absolute left-full ml-2 top-0 bg-gray-900 rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="text-sm font-semibold text-white">{isConnected ? 'Connected' : 'Disconnected'}</div>
        </div>
      </div>
    </div>
  );
};

const GroupChatWhatsApp = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [, setIsConnecting] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [ws, setWs] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [, setMutedMembers] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const sendingMessageRef = useRef(false);
  const connectionLockRef = useRef(false);

  // Auto-scroll function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // WebSocket connection with improved stability
  const connectWebSocket = useCallback(() => {
    if (connectionLockRef.current || !username.trim()) return;
    
    connectionLockRef.current = true;
    setIsConnecting(true);
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname === 'localhost' ? '127.0.0.1:5004' : '127.0.0.1:5004';
      const wsUrl = `${protocol}//${host}/chat?username=${encodeURIComponent(username)}&room=general`;
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        connectionLockRef.current = false;
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received message:', data);

          if (data.type === 'message') {
            setMessages(prev => [...prev, data]);
            scrollToBottom();
          } else if (data.type === 'userList') {
            console.log('📋 Received userList:', data);
            console.log('📋 data.users type:', typeof data.users);
            console.log('📋 data.users value:', data.users);
            console.log('📋 data.users isArray:', Array.isArray(data.users));
            setOnlineMembers(data.users || []);
          } else if (data.type === 'user_joined') {
            console.log('👤 Received user_joined:', data);
            console.log('👤 data.username:', data.username);
            console.log('👤 data.username type:', typeof data.username);
            setOnlineMembers(prev => {
              const newMembers = [...prev, data.username];
              console.log('👤 Updated onlineMembers:', newMembers);
              return newMembers;
            });
            // Add join notification message
            const joinMessage = {
              type: 'system',
              username: 'System',
              content: `${data.username} joined the chat`,
              timestamp: new Date().toISOString(),
              id: `join_${Date.now()}`
            };
            setMessages(prev => [...prev, joinMessage]);
            scrollToBottom();
          } else if (data.type === 'user_left') {
            setOnlineMembers(prev => prev.filter(member => member !== data.username));
            // Add leave notification message
            const leaveMessage = {
              type: 'system',
              username: 'System',
              content: `${data.username} left the chat`,
              timestamp: new Date().toISOString(),
              id: `leave_${Date.now()}`
            };
            setMessages(prev => [...prev, leaveMessage]);
            scrollToBottom();
          } else if (data.type === 'reaction') {
            setMessages(prev => prev.map(msg => 
              msg.id === data.messageId 
                ? { ...msg, reactions: { ...msg.reactions, [data.emoji]: data.users } }
                : msg
            ));
          } else if (data.type === 'file_share') {
            setMessages(prev => [...prev, data]);
            scrollToBottom();
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        connectionLockRef.current = false;
        setWs(null);
        
        // Only auto-reconnect if it wasn't a normal closure
        if (event.code !== 1000) {
          setTimeout(() => {
            if (!connectionLockRef.current && username.trim()) {
              console.log('🔄 Attempting to reconnect...');
              connectWebSocket();
            }
          }, 3000);
        }
      };

      websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnecting(false);
        connectionLockRef.current = false;
      };
      
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      setIsConnecting(false);
      connectionLockRef.current = false;
    }
  }, [username, scrollToBottom]);

  // Send message function
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !isConnected || sendingMessageRef.current) return;

    sendingMessageRef.current = true;
    const messageData = {
      type: 'message',
      content: newMessage.trim(),
      username,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
      replyTo
    };

    try {
      ws.send(JSON.stringify(messageData));
      
      // Add message locally for immediate display
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      setReplyTo(null);
      scrollToBottom();
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      sendingMessageRef.current = false;
    }
  }, [newMessage, isConnected, username, ws, replyTo, scrollToBottom]);

  // Handle reaction
  const handleReaction = useCallback((messageId, emoji) => {
    if (!isConnected) return;

    const reactionData = {
      type: 'reaction',
      messageId,
      emoji,
      username
    };

    try {
      ws.send(JSON.stringify(reactionData));
    } catch (error) {
      console.error('❌ Error sending reaction:', error);
    }
  }, [isConnected, username, ws]);

  // Handle reply
  const handleReply = useCallback((message) => {
    setReplyTo({
      id: message.id,
      username: message.username,
      content: message.content
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
      return;
    }

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Uploading file to group chat:', file.name, file.type, file.size);

      fetch('http://127.0.0.1:5004/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        console.log('📤 Upload response status:', response.status);
        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('📤 Upload response data:', data);
        
        // Backend returns: { code, filename, size, message }
        if (data.code && data.filename) {
          const fileUrl = `http://127.0.0.1:5004/download/${data.code}`;
          
          // Send file share message via WebSocket
          const fileShareData = {
            type: 'file_share',
            username,
            fileUrl,
            fileName: data.filename,
            fileType: file.type,
            fileSize: file.size,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
          };
          
          console.log('📤 Sending file share message:', fileShareData);
          
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(fileShareData));
            console.log('✅ File share message sent successfully');
          } else {
            console.error('❌ WebSocket not connected, cannot send file share message');
            alert('File uploaded but cannot share in chat (WebSocket not connected)');
          }
          
          // Also add as file share message for display
          const fileMessage = {
            type: 'file_share',
      username,
            content: `📎 ${data.filename}`,
      timestamp: new Date().toISOString(),
            id: Date.now().toString(),
            fileUrl,
            fileName: data.filename,
            fileType: file.type,
            fileSize: file.size,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
          };
          
          setMessages(prev => [...prev, fileMessage]);
        } else {
          console.error('❌ Invalid upload response:', data);
          alert('File upload failed: Invalid response from server');
        }
      })
      .catch(error => {
        console.error('❌ File upload error:', error);
        alert(`Failed to upload file: ${error.message}`);
      });
    });

    event.target.value = '';
  }, [username, ws]);

  // Effects
  useEffect(() => {
    if (username.trim()) {
      connectWebSocket();
    }
  }, [username, connectWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show username modal if user hasn't joined yet
  useEffect(() => {
    if (!username.trim()) {
      setShowUsernameModal(true);
    }
  }, [username]);

  // Clean up expired files every minute
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setMessages(prev => prev.filter(message => {
        if (message.type === 'file_share' && message.expiresAt) {
          const now = new Date();
          const expiresAt = new Date(message.expiresAt);
          return now < expiresAt;
        }
        return true;
      }));
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  // Admin panel handlers
  const handleAdminLogin = () => {
    if (adminKey === 'Akshatha2004') {
      setIsAdmin(true);
      setShowAdminPanel(false);
    } else {
      alert('Invalid admin key');
    }
  };

  const muteMember = (member) => {
    setMutedMembers(prev => [...prev, member]);
  };

  // Sidebar handlers
  const handleShowMembers = () => {
    setShowMembersPanel(!showMembersPanel);
  };

  const handleShowEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleShowSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleShowNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleShowAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  // Handle joining chat with username
  const handleJoinChat = () => {
    if (username.trim()) {
      setShowUsernameModal(false);
      // Send join notification via WebSocket if connected
      if (ws && ws.readyState === WebSocket.OPEN) {
        const joinData = {
          type: 'user_joined',
          username: username.trim(),
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(joinData));
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setShowAdminPanel(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // Don't show main chat if username modal is open
  if (showUsernameModal) {
  return (
      <div className="flex h-screen bg-black overflow-hidden">
        {/* Username Modal with Windows 11-style blur */}
        <AnimatePresence>
          {showUsernameModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Join Group Chat</h3>
                
                <div className="space-y-6">
          <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Enter your username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinChat()}
                      placeholder="Type your username..."
                      className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-lg border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      autoFocus
                    />
        </div>
        
                  <div className="flex space-x-4">
              <button
                      onClick={handleJoinChat}
                      disabled={!username.trim()}
                      className="flex-1 bg-white text-black py-3 rounded-2xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
                    >
                      Join Chat
              </button>
            </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      {/* Natural blur background effect */}
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"></div>
      {/* Small Sidebar - Fixed */}
      <div className="flex-shrink-0 relative z-10">
        <SmallSidebar 
          onlineMembers={onlineMembers}
          isAdmin={isAdmin}
          onShowSettings={handleShowSettings}
          onShowMembers={handleShowMembers}
          onShowNotifications={handleShowNotifications}
          onShowAdminPanel={handleShowAdminPanel}
          onShowEmojiPicker={handleShowEmojiPicker}
          isConnected={isConnected}
        />
      </div>

      {/* Main Chat Area - Fixed height */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Messages Area - Only this should scroll */}
        <div className="flex-1 overflow-y-auto bg-black/80 backdrop-blur-sm p-6" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-800/80 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-600">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Welcome to Group Chat!</h3>
                <p className="text-gray-400 text-lg">Start a conversation by sending a message below.</p>
              </div>
            ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                  onReaction={handleReaction}
                  onReply={handleReply}
                  currentUser={username}
              />
            ))
          )}
        <div ref={messagesEndRef} />
          </div>
      </div>

        {/* Reply indicator with black theme - Fixed above input */}
        {replyTo && (
          <div className="bg-gray-900 border-l-4 border-white px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Replying to {replyTo.username}</div>
                <div className="text-sm text-gray-300 truncate">{replyTo.content}</div>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Message Input with black theme - Fixed at bottom */}
        <div className="bg-black/80 backdrop-blur-lg border-t border-gray-700 p-6 flex-shrink-0" style={{ height: '120px' }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
          <button
            onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-110"
              >
                <Paperclip className="w-5 h-5 text-white" />
          </button>

              <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isConnected ? "Type a message..." : "Connecting..."}
                disabled={!isConnected}
                  className="w-full px-6 py-4 bg-gray-800/80 backdrop-blur-lg border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent disabled:opacity-50 text-white placeholder-gray-400 text-lg"
            />
            <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Smile className="w-5 h-5 text-white" />
            </button>
          </div>

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
                className="p-4 bg-white text-black rounded-2xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
              >
                <Send className="w-5 h-5" />
          </button>
        </div>
          </div>
        </div>
        </div>

      {/* Members Panel with black theme */}
      <AnimatePresence>
        {showMembersPanel && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 bg-black border-l border-gray-900 flex flex-col shadow-2xl h-screen overflow-hidden"
          >
            <div className="p-6 border-b border-gray-900">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Members</h3>
                <button
                  onClick={() => setShowMembersPanel(false)}
                  className="p-2 hover:bg-gray-900 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
      </div>

            <div className="flex-1 overflow-y-auto p-6" style={{ height: 'calc(100vh - 120px)' }}>
              <div className="space-y-4">
                {console.log('🔍 Rendering onlineMembers:', onlineMembers)}
                {onlineMembers.map((member, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-900 rounded-2xl transition-all duration-200">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-black text-sm font-bold">
                        {member.charAt(0).toUpperCase()}
                      </span>
              </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{member}</div>
                      <div className="text-xs text-green-400 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Online</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-2">
                <button
                          onClick={() => muteMember(member)}
                          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                          title="Mute"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal with black theme */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-900 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Admin Panel</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Admin Key
                  </label>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter admin key"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-gray-400"
                  />
                </div>

                <div className="flex space-x-4">
                <button
                    onClick={handleAdminLogin}
                    className="flex-1 bg-white text-black py-3 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Login
              </button>
                  <button
                    onClick={() => setShowAdminPanel(false)}
                    className="flex-1 bg-gray-800 text-white py-3 rounded-2xl hover:bg-gray-700 transition-all duration-200 font-semibold"
                  >
                    Cancel
                </button>
              </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal with blur */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Username
                  </label>
                <input
                  type="text"
                    value={username}
                    disabled
                    className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-lg border border-gray-600 rounded-2xl text-white"
                />
              </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Connection Status
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-white">{isConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Online Members
                  </label>
                  <span className="text-white">{onlineMembers.length} members online</span>
                </div>
                
                <div className="flex space-x-4">
                <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-white text-black py-3 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Close
                </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal with blur */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Notifications</h3>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600">
                    <span className="text-white">Message Notifications</span>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600">
                    <span className="text-white">Sound Notifications</span>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-600">
                    <span className="text-white">Desktop Notifications</span>
                    <div className="w-12 h-6 bg-gray-800 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                <button
                    onClick={() => setShowNotifications(false)}
                    className="flex-1 bg-white text-black py-3 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Close
                </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker Modal with blur */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Choose Emoji</h3>
              
              <div className="grid grid-cols-8 gap-4 mb-6">
                {['😀', '😂', '😍', '🥰', '😎', '🤔', '😮', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙌', '🤝', '💪', '🎯', '⭐', '✨', '💫', '🌟', '💎', '🏆', '🎊', '🎈', '🎁', '🍕', '🍔', '🍰', '☕', '🍺', '🚀', '💻', '📱', '🎮', '🎵', '🎬', '📚', '🏠', '🌍', '🌙', '☀️', '🌈', '⚡', '❄️', '🔥', '💧', '🌊', '🏔️', '🌺', '🌸', '🌻', '🌹', '🌷', '🍀', '🌿', '🌱', '🌳', '🌲', '🌴', '🌵', '🌾', '🌽', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥙', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'].map((emoji, index) => (
                <button
                    key={index}
                  onClick={() => {
                      setNewMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                  }}
                    className="text-2xl p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                    {emoji}
                </button>
                ))}
                </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="flex-1 bg-white text-black py-3 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-lg"
                >
                  Close
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default GroupChatWhatsApp;