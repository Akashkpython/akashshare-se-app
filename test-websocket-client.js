// Simple WebSocket client for testing
import { WebSocket } from 'ws';

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:5002/chat?username=TestUser&room=general');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  
  // Send a test message
  ws.send(JSON.stringify({
    type: 'message',
    message: 'Hello from test client!'
  }));
  
  // Send a room switch message after 2 seconds
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'switchRoom',
      room: 'test-room'
    }));
  }, 2000);
});

ws.on('message', function message(data) {
  console.log('Received:', data.toString());
});

ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});