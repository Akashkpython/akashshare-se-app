import WebSocket from 'ws';

// Integration test for WebSocket server and GroupChat component
const TEST_SERVER = 'ws://localhost:5002/chat';
const TEST_TIMEOUT = 15000; // 15 seconds

// Test configuration
const testConfig = {
  users: [
    { username: 'TestUser1', initialRoom: 'general' },
    { username: 'TestUser2', initialRoom: 'help' },
    { username: 'TestUser3', initialRoom: 'announcements' }
  ],
  messagesToSend: [
    { from: 0, content: 'Hello from TestUser1', room: 'general' },
    { from: 1, content: 'Hello from TestUser2', room: 'help' },
    { from: 2, content: 'Hello from TestUser3', room: 'announcements' }
  ],
  roomSwitches: [
    { user: 0, fromRoom: 'general', toRoom: 'help' },
    { user: 1, fromRoom: 'help', toRoom: 'announcements' }
  ]
};

// Test results tracking
const testResults = {
  connections: { success: 0, failed: 0 },
  messages: { sent: 0, received: 0, verified: 0 },
  userEvents: { joined: 0, left: 0 },
  roomSwitches: { attempted: 0, success: 0 },
  errors: []
};

// Client connections
const clients = [];

// Test execution
console.log('🧪 Starting WebSocket Integration Test');
console.log('==========================================');

// Connect all test users
testConfig.users.forEach((user, index) => {
  console.log(`🔌 Connecting ${user.username} to ${user.initialRoom}...`);
  
  const client = new WebSocket(`${TEST_SERVER}?username=${user.username}&room=${user.initialRoom}`);
  
  // Store client info
  const clientInfo = {
    id: index,
    username: user.username,
    room: user.initialRoom,
    ws: client,
    connected: false,
    receivedMessages: [],
    userEvents: [],
    roomSwitches: []
  };
  
  clients.push(clientInfo);
  
  // Connection opened
  client.on('open', () => {
    console.log(`✅ ${user.username} connected to ${user.initialRoom}`);
    clientInfo.connected = true;
    testResults.connections.success++;
  });
  
  // Listen for messages
  client.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📥 ${user.username} received: ${message.type}`);
      
      // Track message types
      switch (message.type) {
        case 'message':
          testResults.messages.received++;
          // Verify message content if it's one of our test messages
          testConfig.messagesToSend.forEach(testMsg => {
            if (testMsg.content === message.message) {
              testResults.messages.verified++;
            }
          });
          break;
          
        case 'userJoined':
          testResults.userEvents.joined++;
          break;
          
        case 'userLeft':
          testResults.userEvents.left++;
          break;
          
        case 'roomSwitched':
          // Track successful room switches
          testConfig.roomSwitches.forEach(switchInfo => {
            if (switchInfo.user === index && message.newRoom === switchInfo.toRoom) {
              testResults.roomSwitches.success++;
              clientInfo.room = message.newRoom;
            }
          });
          break;
      }
      
      // Store message for verification
      clientInfo.receivedMessages.push(message);
      
    } catch (error) {
      console.error(`Error parsing message for ${user.username}:`, error);
      testResults.errors.push(`Message parse error for ${user.username}: ${error.message}`);
    }
  });
  
  // Connection error
  client.on('error', (error) => {
    console.error(`❌ ${user.username} connection error:`, error.message);
    testResults.connections.failed++;
    testResults.errors.push(`Connection error for ${user.username}: ${error.message}`);
  });
  
  // Connection closed
  client.on('close', () => {
    console.log(`🔌 ${user.username} disconnected`);
    clientInfo.connected = false;
  });
});

// Wait for all connections to establish
setTimeout(() => {
  // Send test messages
  testConfig.messagesToSend.forEach((message, index) => {
    const client = clients[message.from];
    
    if (client && client.connected) {
      console.log(`📤 Sending message from ${client.username}: ${message.content}`);
      
      client.ws.send(JSON.stringify({
        type: 'message',
        message: message.content,
        room: client.room
      }));
      
      testResults.messages.sent++;
    }
  });
  
  // Execute room switches after messages
  setTimeout(() => {
    testConfig.roomSwitches.forEach((switchInfo, index) => {
      const client = clients[switchInfo.user];
      
      if (client && client.connected) {
        console.log(`🔄 Switching ${client.username} from ${switchInfo.fromRoom} to ${switchInfo.toRoom}`);
        
        client.ws.send(JSON.stringify({
          type: 'switchRoom',
          room: switchInfo.toRoom
        }));
        
        testResults.roomSwitches.attempted++;
      }
    });
  }, 2000);
}, 2000);

// End test and print results
setTimeout(() => {
  // Close all connections
  clients.forEach(client => {
    if (client.connected) {
      console.log(`🔌 Closing connection for ${client.username}`);
      client.ws.close();
    }
  });
  
  // Print test results
  console.log('\n📊 INTEGRATION TEST RESULTS:');
  console.log('==========================');
  console.log(`Connections: ${testResults.connections.success} successful, ${testResults.connections.failed} failed`);
  console.log(`Messages: ${testResults.messages.sent} sent, ${testResults.messages.received} received, ${testResults.messages.verified} verified`);
  console.log(`User Events: ${testResults.userEvents.joined} joined, ${testResults.userEvents.left} left`);
  console.log(`Room Switches: ${testResults.roomSwitches.attempted} attempted, ${testResults.roomSwitches.success} successful`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach((err, i) => console.log(`${i+1}. ${err}`));
  }
  
  // Verify test expectations
  const testPassed = 
    testResults.connections.success === testConfig.users.length &&
    testResults.connections.failed === 0 &&
    testResults.messages.sent === testConfig.messagesToSend.length &&
    testResults.messages.verified > 0 &&
    testResults.userEvents.joined >= testConfig.users.length &&
    testResults.roomSwitches.success > 0;
  
  console.log(`\n${testPassed ? '✅ INTEGRATION TEST PASSED' : '❌ INTEGRATION TEST FAILED'}`);
  
  // Exit with appropriate code
  process.exit(testPassed ? 0 : 1);
}, TEST_TIMEOUT);