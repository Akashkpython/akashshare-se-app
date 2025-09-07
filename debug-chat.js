// Debug script to test GroupChat message flow
const WebSocket = require('ws');

console.log('🔍 Testing GroupChat message flow...');

const ws = new WebSocket('ws://localhost:5002/chat?username=DebugUser&room=general');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket');
  console.log('📤 Sending test message...');

  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'message',
      message: 'Hello from debug script!',
      room: 'general'
    }));
  }, 1000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📥 Received message type:', message.type);
    console.log('📄 Full message:', JSON.stringify(message, null, 2));

    if (message.type === 'userList') {
      console.log('👥 User list received:', message.users);
    } else if (message.type === 'userJoined') {
      console.log('➕ User joined:', message.username);
      console.log('👥 Updated user list:', message.users);
    } else if (message.type === 'message') {
      console.log('💬 Chat message:', message.username + ':', message.message);
    }
  } catch (error) {
    console.log('📥 Raw message:', data.toString());
  }
});

ws.on('close', (code, reason) => {
  console.log(`🔌 Connection closed (code: ${code}, reason: ${reason})`);
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
  process.exit(1);
});

setTimeout(() => {
  console.log('⏰ Closing debug connection');
  ws.close();
}, 10000);
