// AI/ML Enhanced WebSocket Chat System
// Features: Smart message filtering, sentiment analysis, auto-moderation

import { WebSocket } from "ws";
import EventEmitter from "events";

class AIEnhancedChat extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
    this.rooms = new Map();
    this.messageHistory = new Map();
    this.aiFeatures = {
      sentimentAnalysis: true,
      autoModeration: true,
      smartFiltering: true,
      messageEnhancement: true
    };
  }

  // Initialize AI-Enhanced WebSocket Chat
  initialize(wss) {
    console.log('🤖 Initializing AI-Enhanced WebSocket Chat System');
    
    wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    // Start AI background processes
    this.startAIProcesses();
  }

  // Handle new WebSocket connections
  handleConnection(ws, req) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const username = url.searchParams.get('username') || `User${Math.floor(Math.random() * 10000)}`;
      const room = url.searchParams.get('room') || 'general';
      
      const connectionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store connection with AI metadata
      const connectionData = {
        id: connectionId,
        ws,
        username,
        room,
        joinedAt: new Date(),
        messageCount: 0,
        sentimentScore: 0,
        isActive: true,
        aiFlags: {
          verified: true,
          trustScore: 1.0,
          spamScore: 0
        }
      };

      this.connections.set(connectionId, connectionData);
      ws.connectionId = connectionId;

      // CRITICAL: Add to global connections for server compatibility
      if (!global.wsConnections) {
        global.wsConnections = new Set();
      }
      global.wsConnections.add(ws);

      console.log(`🤖 AI Chat: User "${username}" joined room "${room}" with AI profiling`);

      // Add to room
      this.addToRoom(room, connectionData);

      // Send AI-enhanced welcome
      this.sendAIWelcome(ws, connectionData);

      // Setup message handlers
      ws.on('message', (data) => this.handleMessage(connectionId, data));
      ws.on('close', () => this.handleDisconnect(connectionId));
      ws.on('error', (error) => this.handleError(connectionId, error));

    } catch (error) {
      console.error('🤖 AI Chat connection error:', error);
      ws.close();
    }
  }

  // Add user to room with AI tracking
  addToRoom(roomName, connectionData) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, {
        name: roomName,
        users: new Map(),
        messageCount: 0,
        aiMetrics: {
          averageSentiment: 0,
          activityLevel: 'low',
          moderationLevel: 'standard'
        }
      });
    }

    const room = this.rooms.get(roomName);
    room.users.set(connectionData.id, connectionData);

    // Broadcast user join with AI insights
    this.broadcastToRoom(roomName, {
      type: 'userJoined',
      username: connectionData.username,
      users: Array.from(room.users.values()).map(u => u.username),
      aiInsight: this.generateJoinInsight(connectionData),
      timestamp: new Date().toISOString()
    }, connectionData.id);
  }

  // Handle incoming messages with AI processing
  async handleMessage(connectionId, data) {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) return;

      const message = JSON.parse(data.toString());
      console.log(`🤖 AI Processing message from ${connection.username}:`, message.type);

      // AI Pre-processing
      const aiProcessedMessage = await this.aiProcessMessage(message, connection);
      
      if (aiProcessedMessage.blocked) {
        this.sendToConnection(connectionId, {
          type: 'messageBlocked',
          reason: aiProcessedMessage.reason,
          suggestion: aiProcessedMessage.suggestion
        });
        return;
      }

      switch (message.type) {
        case 'message':
          await this.handleTextMessage(connection, aiProcessedMessage);
          break;
        case 'image':
          await this.handleImageMessage(connection, aiProcessedMessage);
          break;
        default:
          console.log('🤖 Unknown message type:', message.type);
      }

    } catch (error) {
      console.error('🤖 AI Message processing error:', error);
    }
  }

  // AI Message Processing Pipeline
  async aiProcessMessage(message, connection) {
    const processed = { ...message };
    
    // Sentiment Analysis
    if (message.message) {
      processed.sentiment = this.analyzeSentiment(message.message);
      connection.sentimentScore = (connection.sentimentScore + processed.sentiment) / 2;
    }

    // Auto Moderation
    const moderationResult = this.moderateContent(message.message || '');
    if (!moderationResult.allowed) {
      return {
        ...processed,
        blocked: true,
        reason: moderationResult.reason,
        suggestion: moderationResult.suggestion
      };
    }

    // Smart Enhancement
    if (message.message) {
      processed.enhanced = this.enhanceMessage(message.message);
    }

    // Spam Detection
    const spamScore = this.detectSpam(message, connection);
    if (spamScore > 0.7) {
      connection.aiFlags.spamScore += 0.1;
      return {
        ...processed,
        blocked: true,
        reason: 'Potential spam detected',
        suggestion: 'Please avoid repetitive or promotional content'
      };
    }

    return processed;
  }

  // Handle text messages with AI features
  async handleTextMessage(connection, processedMessage) {
    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content: processedMessage.message,
      enhancedContent: processedMessage.enhanced,
      username: connection.username,
      timestamp: new Date().toISOString(),
      room: connection.room,
      ai: {
        sentiment: processedMessage.sentiment,
        enhanced: !!processedMessage.enhanced,
        trustScore: connection.aiFlags.trustScore
      }
    };

    // Store in AI memory
    this.storeMessage(connection.room, messageData);

    // Broadcast with AI metadata
    this.broadcastToRoom(connection.room, {
      type: 'message',
      message: messageData.content,
      username: messageData.username,
      messageId: messageData.id,
      timestamp: messageData.timestamp,
      ai: messageData.ai
    });

    // Update connection stats
    connection.messageCount++;
    
    console.log(`🤖 AI Chat [${connection.room}] ${connection.username}: ${messageData.content} (sentiment: ${processedMessage.sentiment?.toFixed(2)})`);
  }

  // Handle image messages with AI analysis
  async handleImageMessage(connection, processedMessage) {
    // Basic image handling - can be enhanced with AI image analysis
    const messageData = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'image',
      imageUrl: processedMessage.imageUrl,
      caption: processedMessage.caption || '',
      username: connection.username,
      timestamp: new Date().toISOString(),
      room: connection.room,
      ai: {
        analyzed: false, // Could add image AI analysis here
        safe: true
      }
    };

    this.storeMessage(connection.room, messageData);

    this.broadcastToRoom(connection.room, {
      type: 'image',
      imageUrl: messageData.imageUrl,
      caption: messageData.caption,
      username: messageData.username,
      messageId: messageData.id,
      timestamp: messageData.timestamp,
      ai: messageData.ai
    });
  }

  // Sentiment Analysis (Simple implementation - can be enhanced with ML models)
  analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'awesome', 'amazing', 'wonderful', 'excellent', 'fantastic', 'love', 'like', 'happy', 'excited'];
    const negativeWords = ['bad', 'awful', 'terrible', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return Math.max(-1, Math.min(1, score / words.length));
  }

  // Content Moderation
  moderateContent(text) {
    const bannedWords = ['spam', 'scam', 'hack', 'illegal'];
    const lowerText = text.toLowerCase();
    
    for (const word of bannedWords) {
      if (lowerText.includes(word)) {
        return {
          allowed: false,
          reason: 'Content contains inappropriate language',
          suggestion: 'Please use respectful language'
        };
      }
    }
    
    return { allowed: true };
  }

  // Message Enhancement
  enhanceMessage(text) {
    // Simple enhancement - can be expanded with AI
    if (text.length < 3) return null;
    
    // Auto-correct common typos
    const corrections = {
      'teh': 'the',
      'youre': "you're",
      'dont': "don't",
      'cant': "can't"
    };
    
    let enhanced = text;
    Object.entries(corrections).forEach(([wrong, right]) => {
      enhanced = enhanced.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right);
    });
    
    return enhanced !== text ? enhanced : null;
  }

  // Spam Detection
  detectSpam(message, connection) {
    let spamScore = 0;
    
    // Check for repetitive messages
    const recentMessages = this.getRecentMessages(connection.room, 5);
    const similarCount = recentMessages.filter(msg => 
      msg.username === connection.username && 
      msg.content === message.message
    ).length;
    
    if (similarCount > 2) spamScore += 0.5;
    
    // Check for caps
    if (message.message && message.message === message.message.toUpperCase()) {
      spamScore += 0.2;
    }
    
    // Check message frequency
    if (connection.messageCount > 10) {
      const timeDiff = (Date.now() - connection.joinedAt.getTime()) / 1000;
      if (connection.messageCount / timeDiff > 2) { // More than 2 messages per second
        spamScore += 0.3;
      }
    }
    
    return spamScore;
  }

  // Generate AI insights for user joins
  generateJoinInsight(connection) {
    const insights = [
      `Welcome ${connection.username}! 🤖 AI is ready to enhance your chat experience`,
      `${connection.username} joined with optimal AI settings configured`,
      `New participant detected - AI moderation active`,
      `${connection.username} is now connected to our intelligent chat system`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  // Send AI-enhanced welcome message
  sendAIWelcome(ws, connection) {
    const room = this.rooms.get(connection.room);
    const recentMessages = this.getRecentMessages(connection.room, 10);
    
    // Send welcome with AI features info
    ws.send(JSON.stringify({
      type: 'aiWelcome',
      message: 'Connected to AI-Enhanced Chat',
      features: Object.keys(this.aiFeatures).filter(f => this.aiFeatures[f]),
      roomInfo: {
        name: connection.room,
        userCount: room ? room.users.size : 0,
        aiMetrics: room ? room.aiMetrics : null
      },
      timestamp: new Date().toISOString()
    }));

    // Send recent messages
    if (recentMessages.length > 0) {
      ws.send(JSON.stringify({
        type: 'messageHistory',
        messages: recentMessages,
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Store message in AI memory
  storeMessage(room, messageData) {
    if (!this.messageHistory.has(room)) {
      this.messageHistory.set(room, []);
    }
    
    const history = this.messageHistory.get(room);
    history.push(messageData);
    
    // Keep only last 100 messages per room
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  // Get recent messages
  getRecentMessages(room, limit = 20) {
    const history = this.messageHistory.get(room) || [];
    return history.slice(-limit);
  }

  // Broadcast to room
  broadcastToRoom(roomName, message, excludeConnectionId = null) {
    const room = this.rooms.get(roomName);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    room.users.forEach((connection) => {
      if (connection.id !== excludeConnectionId && 
          connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error('🤖 AI Broadcast error:', error);
        }
      }
    });

    console.log(`🤖 AI Broadcasted to ${sentCount} clients in room "${roomName}"`);
  }

  // Send message to specific connection
  sendToConnection(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
    }
  }

  // Handle disconnection
  handleDisconnect(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    console.log(`🤖 AI Chat: User "${connection.username}" left room "${connection.room}"`);

    // Remove from room
    const room = this.rooms.get(connection.room);
    if (room) {
      room.users.delete(connectionId);
      
      // Broadcast user left
      this.broadcastToRoom(connection.room, {
        type: 'userLeft',
        username: connection.username,
        users: Array.from(room.users.values()).map(u => u.username),
        timestamp: new Date().toISOString()
      });
    }

    // Remove connection
    this.connections.delete(connectionId);

    // CRITICAL: Remove from global connections
    if (global.wsConnections && connection.ws) {
      global.wsConnections.delete(connection.ws);
    }
  }

  // Handle errors
  handleError(connectionId, error) {
    console.error(`🤖 AI WebSocket error for connection ${connectionId}:`, error);
    this.handleDisconnect(connectionId);
  }

  // Start AI background processes
  startAIProcesses() {
    // Periodic AI analysis
    setInterval(() => {
      this.performPeriodicAnalysis();
    }, 30000); // Every 30 seconds

    console.log('🤖 AI background processes started');
  }

  // Periodic AI analysis
  performPeriodicAnalysis() {
    // Update room metrics
    this.rooms.forEach((room, roomName) => {
      const recentMessages = this.getRecentMessages(roomName, 10);
      
      if (recentMessages.length > 0) {
        const avgSentiment = recentMessages.reduce((sum, msg) => 
          sum + (msg.ai?.sentiment || 0), 0) / recentMessages.length;
        
        room.aiMetrics.averageSentiment = avgSentiment;
        room.aiMetrics.activityLevel = recentMessages.length > 5 ? 'high' : 'low';
      }
    });

    // Update user trust scores
    this.connections.forEach((connection) => {
      if (connection.messageCount > 0) {
        // Increase trust for active, non-spam users
        if (connection.aiFlags.spamScore < 0.3) {
          connection.aiFlags.trustScore = Math.min(1.0, connection.aiFlags.trustScore + 0.01);
        }
      }
    });
  }

  // Get AI statistics
  getAIStats() {
    return {
      totalConnections: this.connections.size,
      totalRooms: this.rooms.size,
      totalMessages: Array.from(this.messageHistory.values()).reduce((sum, history) => sum + history.length, 0),
      aiFeatures: this.aiFeatures,
      averageTrustScore: Array.from(this.connections.values()).reduce((sum, conn) => sum + conn.aiFlags.trustScore, 0) / this.connections.size || 0
    };
  }

  // Get room history
  getRoomHistory(room, limit = 20) {
    return this.getRecentMessages(room, limit);
  }

  // Get chat clients (for compatibility)
  getChatClients() {
    return this.connections;
  }

  // Get rooms (for compatibility)
  getRooms() {
    return this.rooms;
  }
}

// Create singleton instance
const aiChat = new AIEnhancedChat();

// Export functions for compatibility with existing code
export function initializeGroupChat(wss) {
  return aiChat.initialize(wss);
}

export function getChatClients() {
  return aiChat.getChatClients();
}

export function getRooms() {
  return aiChat.getRooms();
}

export function getRoomHistory(room, limit) {
  return aiChat.getRoomHistory(room, limit);
}

export function summarizeMessages(messages) {
  // AI-powered message summarization
  if (!messages || messages.length === 0) return "No recent activity";
  
  const recentCount = messages.length;
  const uniqueUsers = new Set(messages.map(m => m.username)).size;
  const avgSentiment = messages.reduce((sum, m) => sum + (m.ai?.sentiment || 0), 0) / messages.length;
  
  let summary = `${recentCount} messages from ${uniqueUsers} users. `;
  
  if (avgSentiment > 0.2) {
    summary += "Generally positive conversation. 😊";
  } else if (avgSentiment < -0.2) {
    summary += "Mixed emotions in chat. 😐";
  } else {
    summary += "Neutral conversation tone. 💬";
  }
  
  return summary;
}

export default aiChat;
