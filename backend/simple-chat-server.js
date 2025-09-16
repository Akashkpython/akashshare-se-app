import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

const app = express();
const server = createServer(app);

// Enable CORS for all origins
app.use(cors({
  origin: ['http://localhost:5004'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    port: 5004
  });
});

// WebSocket Server
const wss = new WebSocketServer({ 
  server, 
  path: '/chat'
});

const clients = new Map();
const rooms = new Map();

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection');
  
  try {
    // Parse URL parameters
    const url = new URL(req.url, 'http://localhost');
    const username = url.searchParams.get('username') || 'Anonymous';
    const room = url.searchParams.get('room') || 'general';
    
    console.log(`👤 User: ${username}, Room: ${room}`);
    
    // Store client info
    const clientInfo = { username, room, ws };
    clients.set(ws, clientInfo);
    
    // Add to room
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
    }
    rooms.get(room).add(ws);
    
    console.log(`📊 Room ${room} now has ${rooms.get(room).size} users`);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'userJoined',
      username,
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString()
    }));
    
    // Send AI welcome
    ws.send(JSON.stringify({
      type: 'aiWelcome',
      features: ['Real-time chat', 'Image sharing', 'User notifications'],
      timestamp: new Date().toISOString()
    }));
    
    // Handle messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('📨 Received message:', message);
        
        // Broadcast to all users in the room
        const roomClients = rooms.get(room);
        if (roomClients) {
          const broadcastMessage = {
            ...message,
            username,
            messageId: Date.now() + Math.random(),
            timestamp: new Date().toISOString()
          };
          
          roomClients.forEach(client => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify(broadcastMessage));
            }
          });
        }
      } catch (error) {
        console.error('❌ Message parsing error:', error);
      }
    });
    
    // Handle disconnect
    ws.on('close', () => {
      console.log(`🔌 ${username} disconnected`);
      
      // Remove from room
      if (rooms.has(room)) {
        rooms.get(room).delete(ws);
        if (rooms.get(room).size === 0) {
          rooms.delete(room);
        }
      }
      
      // Remove from clients
      clients.delete(ws);
      
      // Notify other users
      if (rooms.has(room)) {
        const leaveMessage = {
          type: 'userLeft',
          username,
          message: `${username} left the chat`,
          timestamp: new Date().toISOString()
        };
        
        rooms.get(room).forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(leaveMessage));
          }
        });
      }
    });
    
  } catch (error) {
    console.error('❌ WebSocket connection error:', error);
    ws.close();
  }
});

const PORT = 5004;
const HOST = '0.0.0.0';  // Changed from 'localhost' to '0.0.0.0' for better network compatibility

server.listen(PORT, HOST, () => {
  console.log('🚀 Simple Chat Server started');
  console.log(`📍 HTTP Server: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`💬 WebSocket Server: ws://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/chat`);
  console.log('✅ Ready for connections!');
});

// Error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

process.on('SIGTERM', () => {
  console.log('🔄 Shutting down server...');
  server.close(() => {
    console.log('✅ Server shut down gracefully');
  });
});
