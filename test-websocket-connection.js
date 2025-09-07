// Simple WebSocket connection test
const WebSocket = require('ws');

console.log('🧪 Testing WebSocket connection to backend...');

const ws = new WebSocket('ws://localhost:5002/chat?username=TestUser&room=general');

ws.on('open', () => {
  console.log('✅ WebSocket connection established successfully!');
  console.log('📤 Sending test message...');

  ws.send(JSON.stringify({
    type: 'message',
    message: 'Hello from test script!',
    room: 'general'
  }));

  // Close after 2 seconds
  setTimeout(() => {
    ws.close(1000, 'Test completed');
  }, 2000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📥 Received message:', message);
  } catch (error) {
    console.log('📥 Received raw data:', data.toString());
  }
});

ws.on('close', (code, reason) => {
  console.log(`🔌 WebSocket closed (code: ${code}, reason: ${reason})`);
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('⏰ Connection timeout - backend may not be responding');
  ws.close();
  process.exit(1);
}, 10000);
