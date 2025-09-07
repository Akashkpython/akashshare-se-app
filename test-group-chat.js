const WebSocket = require('ws');

console.log('Testing Group Chat WebSocket connection...');

// Test WebSocket connection for group chat
const ws = new WebSocket('ws://localhost:5002/chat?username=testuser&room=general');

ws.on('open', function open() {
  console.log('✅ Connected to Group Chat WebSocket server');
  
  // Send a test message
  ws.send(JSON.stringify({
    type: 'message',
    message: 'Hello from group chat test',
    room: 'general'
  }));
  
  console.log('📤 Sent test message to group chat');
});

ws.on('message', function message(data) {
  const message = JSON.parse(data);
  console.log('📥 Received from group chat:', message);
  
  // If we receive a userJoined message, send another test message
  if (message.type === 'userJoined') {
    console.log('👥 User joined notification received');
  }
  
  // If we receive our own message, close connection
  if (message.type === 'message' && message.message === 'Hello from group chat test') {
    console.log('✅ Group chat message delivery confirmed');
    ws.close();
  }
});

ws.on('close', function close() {
  console.log('🔌 Disconnected from Group Chat WebSocket server');
  console.log('✅ Group chat test completed successfully');
  process.exit(0);
});

ws.on('error', function error(err) {
  console.error('❌ Group Chat WebSocket error:', err);
  process.exit(1);
});