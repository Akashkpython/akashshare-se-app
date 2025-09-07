// Test script to verify WebSocket connections work correctly
const WebSocket = require('ws');

console.log('🚀 Testing WebSocket connection to backend...');

// Test WebSocket connection
const testWebSocketConnection = () => {
  const username = `TestUser${Math.floor(Math.random() * 1000)}`;
  const wsUrl = `ws://localhost:5002/chat?username=${encodeURIComponent(username)}&room=general`;
  
  console.log(`🔗 Connecting to: ${wsUrl}`);
  
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', () => {
    console.log('✅ WebSocket connection established successfully');
    
    // Send a test message
    const testMessage = {
      type: 'message',
      message: 'Hello from test script!',
      room: 'general'
    };
    
    ws.send(JSON.stringify(testMessage));
    console.log('📤 Sent test message');
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📥 Received message:', message);
      
      if (message.type === 'userList') {
        console.log('👥 Current users in room:', message.users);
      } else if (message.type === 'message') {
        console.log('💬 Chat message:', message.username, '-', message.message);
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });
  
  ws.on('close', (code, reason) => {
    console.log(`🔌 WebSocket connection closed: ${code} - ${reason || 'No reason'}`);
    process.exit(0);
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    process.exit(1);
  });
  
  // Keep the connection alive for testing
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('✅ Test completed successfully - connection remained open');
      ws.close(1000, 'Test completed');
    }
  }, 10000); // Keep open for 10 seconds
};

// Run the test
testWebSocketConnection();