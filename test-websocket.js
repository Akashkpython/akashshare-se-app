#!/usr/bin/env node

/**
 * Simple WebSocket test script for Akash Share backend
 * This script tests the WebSocket server functionality independently
 */

import WebSocket from 'ws';

const WS_URL = 'ws://localhost:5002/chat';
const TEST_USERNAME = 'TestUser';
const TEST_ROOM = 'general';

console.log('🧪 Starting WebSocket test...');
console.log(`🔗 Connecting to: ${WS_URL}`);
console.log(`👤 Username: ${TEST_USERNAME}`);
console.log(`🏠 Room: ${TEST_ROOM}`);

// Create WebSocket connection
const ws = new WebSocket(`${WS_URL}?username=${encodeURIComponent(TEST_USERNAME)}&room=${encodeURIComponent(TEST_ROOM)}`);

let messageCount = 0;
let testResults = {
  connection: false,
  userList: false,
  message: false,
  roomSwitch: false
};

ws.on('open', () => {
  console.log('✅ WebSocket connection established');
  testResults.connection = true;
  
  // Test 1: Send a test message
  setTimeout(() => {
    console.log('📤 Sending test message...');
    ws.send(JSON.stringify({
      type: 'message',
      message: 'Hello from test script!',
      room: TEST_ROOM
    }));
  }, 1000);
  
  // Test 2: Switch rooms
  setTimeout(() => {
    console.log('🔄 Testing room switch...');
    ws.send(JSON.stringify({
      type: 'switchRoom',
      room: 'help'
    }));
  }, 3000);
  
  // Test 3: Send message in new room
  setTimeout(() => {
    console.log('📤 Sending message in new room...');
    ws.send(JSON.stringify({
      type: 'message',
      message: 'Message in help room!',
      room: 'help'
    }));
  }, 4000);
  
  // Close connection after tests
  setTimeout(() => {
    console.log('🔌 Closing connection...');
    ws.close();
  }, 6000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    messageCount++;
    
    console.log(`📥 Received message #${messageCount}:`, message.type);
    
    switch (message.type) {
      case 'userList':
        console.log('   👥 Users:', message.users);
        testResults.userList = true;
        break;
      case 'userJoined':
        console.log('   ➕ User joined:', message.username);
        break;
      case 'userLeft':
        console.log('   ➖ User left:', message.username);
        break;
      case 'message':
        console.log('   💬 Message:', message.username, ':', message.message);
        testResults.message = true;
        break;
      case 'roomSwitched':
        console.log('   🔄 Room switched to:', message.room);
        console.log('   👥 Users in new room:', message.users);
        testResults.roomSwitch = true;
        break;
      case 'error':
        console.log('   ❌ Error:', message.message);
        break;
      default:
        console.log('   ❓ Unknown message type:', message.type);
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
  }
});

ws.on('close', (code, reason) => {
  console.log(`🔌 WebSocket connection closed: ${code} ${reason}`);
  
  // Print test results
  console.log('\n📊 Test Results:');
  console.log(`   Connection: ${testResults.connection ? '✅' : '❌'}`);
  console.log(`   User List: ${testResults.userList ? '✅' : '❌'}`);
  console.log(`   Message: ${testResults.message ? '✅' : '❌'}`);
  console.log(`   Room Switch: ${testResults.roomSwitch ? '✅' : '❌'}`);
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! WebSocket server is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Check the backend server logs.');
    process.exit(1);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
  console.log('\n💡 Make sure the backend server is running on port 5002');
  console.log('   Run: npm start (in backend directory)');
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  ws.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated');
  ws.close();
  process.exit(0);
});