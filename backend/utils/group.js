// WebSocket group chat utility
// Handles room management, user tracking, and message broadcasting

import { WebSocket } from "ws";

// Store connected clients and rooms
const chatClients = new Map();
const rooms = new Map();

/**
 * Initialize group chat functionality
 * @param {WebSocketServer} wss - WebSocket server instance
 */
export function initializeGroupChat(wss) {
  console.log('🔧 Initializing group chat functionality');
  
  // Handle new WebSocket connections
  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection attempt');
    console.log('📍 Connection request URL:', req.url);
    console.log('📍 Connection headers:', req.headers);
    
    try {
      // Parse URL parameters
      const url = new URL(req.url, 'http://localhost');
      const username = url.searchParams.get('username') || 'Anonymous';
      const room = url.searchParams.get('room') || 'general';
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      
      console.log(`🔗 Group Chat Connection:`);
      console.log(`  👤 User: ${username}`);
      console.log(`  🏠 Room: ${room}`);
      console.log(`  🌐 IP: ${clientIP}`);
      
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
      const userList = Array.from(rooms.get(room)).map(client => chatClients.get(client).username);
      broadcastToRoom(room, {
        type: 'userJoined',
        username,
        users: userList,
        timestamp: new Date().toISOString()
      });
      
      console.log(`  👥 Broadcasting user list:`, userList);
      
      // Send current user list to the new user
      const welcomeMessage = {
        type: 'userList',
        users: userList
      };
      
      try {
        ws.send(JSON.stringify(welcomeMessage));
        console.log(`  ✅ Welcome message sent to ${username}`);
      } catch (error) {
        console.error(`  ❌ Failed to send welcome message:`, error);
      }
      
      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          console.log(`📥 Received message from ${username}:`, message.type);
          
          switch (message.type) {
            case 'message':
              // Validate message content
              if (!message.message || typeof message.message !== 'string') {
                console.warn(`⚠️ Invalid message from ${username}: missing or invalid message content`);
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Invalid message format'
                }));
                return;
              }
              
              // Sanitize message content
              const sanitizedMessage = message.message.trim();
              if (sanitizedMessage.length === 0) {
                console.warn(`⚠️ Empty message from ${username}`);
                return;
              }
              
              if (sanitizedMessage.length > 1000) {
                console.warn(`⚠️ Message too long from ${username}: ${sanitizedMessage.length} characters`);
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Message too long (max 1000 characters)'
                }));
                return;
              }
              
              broadcastToRoom(room, {
                type: 'message',
                username,
                message: sanitizedMessage,
                room: message.room || room,
                timestamp: new Date().toISOString()
              });
              break;
              
            case 'switchRoom': {
              try {
                // Validate new room name
                const newRoom = message.room;
                if (!newRoom || typeof newRoom !== 'string') {
                  console.warn(`⚠️ Invalid room name from ${username}:`, newRoom);
                  ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid room name'
                  }));
                  break;
                }
                
                // Sanitize room name
                const sanitizedRoom = newRoom.trim().toLowerCase();
                if (sanitizedRoom.length === 0 || sanitizedRoom.length > 50) {
                  console.warn(`⚠️ Invalid room name length from ${username}: ${sanitizedRoom.length} characters`);
                  ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Room name must be 1-50 characters'
                  }));
                  break;
                }

                // Remove from old room
                const oldRoom = clientInfo.room;
                if (rooms.has(oldRoom)) {
                  rooms.get(oldRoom).delete(ws);
                  const remainingUsers = Array.from(rooms.get(oldRoom)).map(client => chatClients.get(client).username);
                  
                  console.log(`  📊 Room ${oldRoom} now has ${remainingUsers.length} users after ${username} left`);
                  
                  // Notify others in old room
                  broadcastToRoom(oldRoom, {
                    type: 'userLeft',
                    username,
                    users: remainingUsers,
                    timestamp: new Date().toISOString()
                  });
                }

                // Add to new room
                clientInfo.room = sanitizedRoom;
                if (!rooms.has(sanitizedRoom)) {
                  rooms.set(sanitizedRoom, new Set());
                  console.log(`  🆕 Created new room: ${sanitizedRoom}`);
                }
                rooms.get(sanitizedRoom).add(ws);

                const newRoomUsers = Array.from(rooms.get(sanitizedRoom)).map(client => chatClients.get(client).username);
                console.log(`  📊 Room ${sanitizedRoom} now has ${newRoomUsers.length} users after ${username} joined`);

                // Notify others in new room
                broadcastToRoom(sanitizedRoom, {
                  type: 'userJoined',
                  username,
                  users: newRoomUsers,
                  timestamp: new Date().toISOString()
                });

                // Send confirmation to the client that initiated the switch
                ws.send(JSON.stringify({
                  type: 'roomSwitched',
                  room: sanitizedRoom,
                  users: newRoomUsers,
                  timestamp: new Date().toISOString()
                }));

                console.log(`  🔄 ${username} switched from room ${oldRoom} to ${sanitizedRoom}`);
              } catch (error) {
                console.error('Error switching rooms:', error);
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Failed to switch rooms'
                }));
              }
              break;
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
          // Send error message to client
          try {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to process message'
            }));
          } catch (sendErr) {
            console.error('Failed to send error to client:', sendErr);
          }
        }
      });
      
      // Handle WebSocket closure
      ws.on('close', (code, reason) => {
        const clientData = chatClients.get(ws);
        if (clientData) {
          const { username, room: currentRoom, connectedAt } = clientData;
          const connectionDuration = new Date() - connectedAt;
          
          console.log(`🔌 Group Chat Disconnection:`);
          console.log(`  👤 User: ${username}`);
          console.log(`  🏠 Room: ${currentRoom}`);
          console.log(`  🗑️ Code: ${code}`);
          console.log(`  📝 Reason: ${reason || 'No reason provided'}`);
          console.log(`  ⏱️ Duration: ${Math.round(connectionDuration / 1000)}s`);
          
          // Remove from room
          if (rooms.has(currentRoom)) {
            rooms.get(currentRoom).delete(ws);
            const remainingUsers = Array.from(rooms.get(currentRoom)).map(client => chatClients.get(client).username);
            
            console.log(`  📊 Room ${currentRoom} now has ${remainingUsers.length} users`);
            
            broadcastToRoom(currentRoom, {
              type: 'userLeft',
              username,
              users: remainingUsers
            });
          }
          
          // Remove client
          chatClients.delete(ws);
        } else {
          console.log(`❌ Unknown WebSocket disconnected (code: ${code}, reason: ${reason || 'none'})`);
        }
      });
      
      // Handle WebSocket errors
      ws.on('error', (error) => {
        const clientData = chatClients.get(ws);
        const username = clientData?.username || 'Unknown';
        console.error(`🚨 Group Chat WebSocket Error for user ${username}:`, error);
        
        // Log detailed error information
        if (error.code) {
          console.error(`   Error code: ${error.code}`);
        }
        if (error.message) {
          console.error(`   Error message: ${error.message}`);
        }
        if (error.stack) {
          console.error(`   Error stack: ${error.stack}`);
        }
        
        // Clean up on error
        if (clientData) {
          const { room: currentRoom } = clientData;
          
          // Remove from room
          if (rooms.has(currentRoom)) {
            rooms.get(currentRoom).delete(ws);
            const remainingUsers = Array.from(rooms.get(currentRoom)).map(client => chatClients.get(client).username);
            
            console.log(`   📊 Room ${currentRoom} now has ${remainingUsers.length} users after error cleanup`);
            
            broadcastToRoom(currentRoom, {
              type: 'userLeft',
              username,
              users: remainingUsers,
              timestamp: new Date().toISOString()
            });
          }
          
          // Remove client
          chatClients.delete(ws);
        }
      });
    } catch (error) {
      console.error('Error in WebSocket connection handler:', error);
      try {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Connection initialization failed'
        }));
      } catch (sendErr) {
        console.error('Failed to send error to client:', sendErr);
      }
      ws.close();
    }
  });
}

/**
 * Broadcast a message to all clients in a room
 * @param {string} room - Room name
 * @param {object} message - Message object to broadcast
 */
function broadcastToRoom(room, message) {
  if (rooms.has(room)) {
    const roomClients = rooms.get(room);
    let successCount = 0;
    let errorCount = 0;
    
    roomClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(message));
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to send message to client in room ${room}:`, error);
          errorCount++;
          
          // Remove the problematic client
          roomClients.delete(client);
          chatClients.delete(client);
        }
      } else {
        // Remove closed clients
        roomClients.delete(client);
        chatClients.delete(client);
      }
    });
    
    if (errorCount > 0) {
      console.log(`📊 Broadcast to room ${room}: ${successCount} successful, ${errorCount} failed`);
    }
  } else {
    console.warn(`⚠️ Attempted to broadcast to non-existent room: ${room}`);
  }
}

/**
 * Get current chat statistics
 * @returns {object} Chat statistics
 */
export function getChatStats() {
  const totalClients = chatClients.size;
  const totalRooms = rooms.size;
  const roomStats = {};

  // Get stats for each room
  rooms.forEach((clients, roomName) => {
    roomStats[roomName] = clients.size;
  });

  return {
    totalClients,
    totalRooms,
    roomStats
  };
}

/**
 * Get all connected clients
 * @returns {Map} Map of connected clients
 */
export function getChatClients() {
  return chatClients;
}

/**
 * Get all rooms
 * @returns {Map} Map of rooms
 */
export function getRooms() {
  return rooms;
}