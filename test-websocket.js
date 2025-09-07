const WebSocket = require('ws');

// Test WebSocket connection
const ws = new WebSocket('ws://localhost:5002/chat?username=testuser&room=general');

ws.on('open', function open() {
  console.log('✅ Connected to WebSocket server');
  
  // Send a test message
  ws.send(JSON.stringify({
    type: 'message',
    message: 'Hello from test client',
    room: 'general'
  }));
});

ws.on('message', function message(data) {
  console.log('📥 Received:', data.toString());
  
  // Close connection after receiving first message
  ws.close();
});

ws.on('close', function close() {
  console.log('🔌 Disconnected from WebSocket server');
  process.exit(0);
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
  process.exit(1);
});