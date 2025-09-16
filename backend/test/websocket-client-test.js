// Simple WebSocket client test script
import WebSocket from 'ws';

// Configuration
const username = 'TestUser' + Math.floor(Math.random() * 1000);
const room = 'general';
const serverUrl = `ws://localhost:5004/chat?username=${encodeURIComponent(username)}&room=${room}`;

// Create WebSocket connection
console.log(`Connecting to ${serverUrl}...`);
const ws = new WebSocket(serverUrl);

// Connection opened
ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
  
  // Send a test message after 1 second
  setTimeout(() => {
    const message = {
      type: 'message',
      message: 'Hello from test client!',
      room: room
    };
    
    console.log('📤 Sending message:', message);
    ws.send(JSON.stringify(message));
  }, 1000);
});

// Listen for messages
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📥 Received message:', message);
    
    // If we receive our own message back, close the connection after 2 seconds
    if (message.type === 'message' && 
        message.username === username && 
        message.message === 'Hello from test client!') {
      console.log('✅ Test successful! Received our own message back.');
      setTimeout(() => {
        console.log('Closing connection...');
        ws.close();
        process.exit(0);
      }, 2000);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
  process.exit(1);
});

// Connection closed
ws.on('close', () => {
  console.log('🔌 Connection closed');
});

// Exit after timeout (in case the test doesn't complete)
setTimeout(() => {
  console.log('⏰ Test timeout reached. Exiting...');
  process.exit(1);
}, 10000);