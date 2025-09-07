// Simplified server for testing WebSocket functionality
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/chat' });

// Store connected clients
export const chatClients = new Map();
export const rooms = new Map();

// Helper function to broadcast messages to a room
export function broadcastToRoom(roomName, message) {
  if (!rooms.has(roomName)) return;
  
  const messageStr = JSON.stringify(message);
  rooms.get(roomName).forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN = 1
      client.send(messageStr);
    }
  });
}

// WebSocket chat functionality
wss.on('connection', (ws, req) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const username = url.searchParams.get('username') || 'Anonymous';
    const room = url.searchParams.get('room') || 'general';
    
    // Validate username and room
    if (username.length > 50) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Username too long (max 50 characters)'
      }));
      ws.close();
      return;
    }
    
    if (room.length > 50) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Room name too long (max 50 characters)'
      }));
      ws.close();
      return;
    }
    
    console.log(`🔗 WebSocket Connection:`);
    console.log(`  👤 User: ${username}`);
    console.log(`  🏠 Room: ${room}`);
    
    // Store client info
    const clientInfo = { username, room, ws, connectedAt: new Date() };
    chatClients.set(ws, clientInfo);
    
    // Add to room
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
      console.log(`  🆕 Created new room: ${room}`);
    }
    rooms.get(room).add(ws);
    
    const roomUserCount = rooms.get(room).size;
    console.log(`  📊 Room ${room} now has ${roomUserCount} users`);
    
    // Broadcast user joined
    const userList = Array.from(rooms.get(room))
      .map(client => chatClients.get(client)?.username)
      .filter(Boolean);
      
    broadcastToRoom(room, {
      type: 'userJoined',
      username,
      users: userList,
      timestamp: new Date().toISOString()
    });
    
    // Send current user list
    const userListMessage = JSON.stringify({
      type: 'userList',
      users: userList
    });
    console.log('Sending user list message:', userListMessage);
    ws.send(userListMessage);
    
    // Handle messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'message':
            broadcastToRoom(room, {
              type: 'message',
              username,
              message: message.message, // Changed from 'text' to 'message' for consistency
              timestamp: new Date().toISOString()
            });
            break;
            
          case 'changeRoom':
            // Remove from current room
            if (rooms.has(room)) {
              rooms.get(room).delete(ws);
              
              // Broadcast user left
              broadcastToRoom(room, {
                type: 'userLeft',
                username,
                timestamp: new Date().toISOString()
              });
            }
            
            // Update client info
            const newRoom = message.room || 'general';
            clientInfo.room = newRoom;
            
            // Add to new room
            if (!rooms.has(newRoom)) {
              rooms.set(newRoom, new Set());
            }
            rooms.get(newRoom).add(ws);
            
            // Broadcast user joined in new room
            const newRoomUserList = Array.from(rooms.get(newRoom))
              .map(client => chatClients.get(client)?.username)
              .filter(Boolean);
              
            broadcastToRoom(newRoom, {
              type: 'userJoined',
              username,
              users: newRoomUserList,
              timestamp: new Date().toISOString()
            });
            
            // Send current user list for new room
            ws.send(JSON.stringify({
              type: 'userList',
              users: newRoomUserList
            }));
            break;
        }
      } catch (error) {
        console.error('❌ Error processing message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      const clientInfo = chatClients.get(ws);
      if (clientInfo) {
        const { username, room } = clientInfo;
        
        // Remove from room
        if (rooms.has(room)) {
          rooms.get(room).delete(ws);
          
          // Broadcast user left
          broadcastToRoom(room, {
            type: 'userLeft',
            username,
            timestamp: new Date().toISOString()
          });
          
          console.log(`👋 User ${username} left room ${room}`);
        }
        
        // Remove client info
        chatClients.delete(ws);
      }
    });
  } catch (error) {
    console.error('❌ Error handling WebSocket connection:', error);
  }
});

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WebSocket test server is running' });
});

// Export server and other components for testing
export default app;
export { server, wss };