// Simple WebSocket test server
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { URL } from 'url';

// Create Express app
const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/chat' });

// Store connected clients
const clients = new Map();
const rooms = new Map();

// Broadcast to room
function broadcastToRoom(room, message) {
  if (!rooms.has(room)) return;
  
  const messageStr = JSON.stringify(message);
  rooms.get(room).forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(messageStr);
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  try {
    // Parse URL parameters
    const params = new URL(req.url, 'http://localhost').searchParams;
    const username = params.get('username') || 'Anonymous';
    const room = params.get('room') || 'general';
    
    console.log(`🔗 WebSocket Connection: ${username} in room ${room}`);
    
    // Store client info
    clients.set(ws, { username, room });
    
    // Add to room
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
      console.log(`Created new room: ${room}`);
    }
    rooms.get(room).add(ws);
    
    // Send user list to all clients in the room
    const userList = Array.from(rooms.get(room))
      .map(client => clients.get(client).username);
    
    broadcastToRoom(room, {
      type: 'userJoined',
      username,
      users: userList,
      timestamp: new Date().toISOString()
    });
    
    // Send welcome message to the new client
    ws.send(JSON.stringify({
      type: 'userList',
      users: userList
    }));
    
    // Message handler
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);
        
        if (message.type === 'message') {
          // Get current room from client data (it might have changed)
          const currentRoom = clients.get(ws).room;
          
          broadcastToRoom(currentRoom, {
            type: 'message',
            username,
            message: message.message,
            timestamp: new Date().toISOString()
          });
        } else if (message.type === 'switchRoom') {
          const oldRoom = clients.get(ws).room;
          const newRoom = message.room;
          
          console.log(`Switching ${username} from ${oldRoom} to ${newRoom}`);
          
          // Remove from old room
          if (rooms.has(oldRoom)) {
            rooms.get(oldRoom).delete(ws);
            
            // Notify users in old room
            const oldRoomUserList = Array.from(rooms.get(oldRoom))
              .map(client => clients.get(client).username);
            
            broadcastToRoom(oldRoom, {
              type: 'userLeft',
              username,
              users: oldRoomUserList,
              timestamp: new Date().toISOString()
            });
          }
          
          // Add to new room
          if (!rooms.has(newRoom)) {
            rooms.set(newRoom, new Set());
            console.log(`Created new room: ${newRoom}`);
          }
          rooms.get(newRoom).add(ws);
          
          // Update client data
          clients.set(ws, { ...clients.get(ws), room: newRoom });
          
          // Notify users in new room
          const newRoomUserList = Array.from(rooms.get(newRoom))
            .map(client => clients.get(client).username);
          
          broadcastToRoom(newRoom, {
            type: 'userJoined',
            username,
            users: newRoomUserList,
            timestamp: new Date().toISOString()
          });
          
          // Notify the client about successful room switch
          ws.send(JSON.stringify({
            type: 'roomSwitched',
            oldRoom,
            newRoom,
            users: newRoomUserList
          }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    // Close handler
    ws.on('close', () => {
      const clientData = clients.get(ws);
      if (clientData) {
        const { username, room } = clientData;
        
        // Remove from room
        if (rooms.has(room)) {
          rooms.get(room).delete(ws);
          
          // Broadcast user left
          const userList = Array.from(rooms.get(room))
            .map(client => clients.get(client).username);
          
          broadcastToRoom(room, {
            type: 'userLeft',
            username,
            users: userList,
            timestamp: new Date().toISOString()
          });
        }
        
        // Remove client
        clients.delete(ws);
        console.log(`${username} disconnected from ${room}`);
      }
    });
  } catch (error) {
    console.error('Error handling connection:', error);
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('WebSocket Test Server');
});

// Start server
const PORT = process.env.PORT || 5004;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebSocket test server running on port ${PORT}`);
});