import WebSocket from 'ws';

// Test multiple clients and rooms
const clients = [];
const rooms = ['general', 'help', 'announcements'];
const testResults = {
  connections: { success: 0, failed: 0 },
  messages: { sent: 0, received: 0 },
  userEvents: { joined: 0, left: 0 },
  roomSwitches: { success: 0, failed: 0 },
  errors: []
};

// Create multiple clients
for (let i = 0; i < 3; i++) {
  const client = new WebSocket(`ws://localhost:5002/chat?username=user${i}&room=${rooms[i % rooms.length]}`);
  
  client.on('open', function open() {
    console.log(`✅ Client ${i} connected to ${rooms[i % rooms.length]}`);
    testResults.connections.success++;
    
    // Store client info
    clients.push({
      id: i,
      username: `user${i}`,
      room: rooms[i % rooms.length],
      ws: client,
      receivedMessages: [],
      userEvents: []
    });
    
    // Send a test message
    client.send(JSON.stringify({
      type: 'message',
      message: `Hello from user${i}`,
      room: rooms[i % rooms.length]
    }));
    testResults.messages.sent++;
    
    // After 2 seconds, switch room
    setTimeout(() => {
      if (i === 1) { // Only user1 switches rooms
        const newRoom = rooms[(i + 1) % rooms.length];
        console.log(`🔄 Client ${i} switching to room: ${newRoom}`);
        
        client.send(JSON.stringify({
          type: 'switchRoom',
          room: newRoom
        }));
        
        // Update client room
        const clientObj = clients.find(c => c.id === i);
        if (clientObj) {
          clientObj.room = newRoom;
          testResults.roomSwitches.success++;
        }
      }
    }, 2000);
  });

  client.on('message', function message(data) {
    try {
      const msg = JSON.parse(data);
      console.log(`📥 Client ${i} received:`, msg.type, msg.username || msg.message || '');
      
      // Track message types
      switch (msg.type) {
        case 'message':
          testResults.messages.received++;
          break;
        case 'userJoined':
          testResults.userEvents.joined++;
          break;
        case 'userLeft':
          testResults.userEvents.left++;
          break;
      }
      
      // Store message for verification
      const clientObj = clients.find(c => c.id === i);
      if (clientObj) {
        clientObj.receivedMessages.push(msg);
      }
    } catch (error) {
      console.error(`Error parsing message for client ${i}:`, error);
      testResults.errors.push(`Message parse error for client ${i}: ${error.message}`);
    }
  });

  client.on('close', function close() {
    console.log(`🔌 Client ${i} disconnected`);
  });

  client.on('error', function error(err) {
    console.error(`❌ Client ${i} error:`, err);
    testResults.connections.failed++;
    testResults.errors.push(`Connection error for client ${i}: ${err.message}`);
  });
}

// Close all connections after 10 seconds
setTimeout(() => {
  clients.forEach((client) => {
    console.log(`🔌 Closing client ${client.id}`);
    client.ws.close();
  });
  
  // Print test results
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('====================');
  console.log(`Connections: ${testResults.connections.success} successful, ${testResults.connections.failed} failed`);
  console.log(`Messages: ${testResults.messages.sent} sent, ${testResults.messages.received} received`);
  console.log(`User Events: ${testResults.userEvents.joined} joined, ${testResults.userEvents.left} left`);
  console.log(`Room Switches: ${testResults.roomSwitches.success} successful`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach((err, i) => console.log(`${i+1}. ${err}`));
  } else {
    console.log('\n✅ All tests completed successfully!');
  }
  
  // Verify test expectations
  const testPassed = 
    testResults.connections.success === 3 && 
    testResults.connections.failed === 0 &&
    testResults.messages.sent > 0 && 
    testResults.messages.received > 0 &&
    testResults.userEvents.joined > 0 &&
    testResults.roomSwitches.success === 1;
  
  console.log(`\n${testPassed ? '✅ TEST PASSED' : '❌ TEST FAILED'}`);
  process.exit(testPassed ? 0 : 1);
}, 10000);