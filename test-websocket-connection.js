import { WebSocket } from 'ws';

console.log('Testing WebSocket connection to Akash Share backend...');

// Test WebSocket connection
const ws = new WebSocket('ws://localhost:5005/chat?username=TestUser&room=general');

ws.on('open', function open() {
  console.log('✅ WebSocket connection established');
  
  // Send a test message
  ws.send(JSON.stringify({
    type: 'message',
    message: 'Hello from test client!',
    room: 'general'
  }));
});

ws.on('message', function incoming(data) {
  console.log('📥 Received:', data.toString());
  
  // Close connection after receiving first message
  ws.close();
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
});