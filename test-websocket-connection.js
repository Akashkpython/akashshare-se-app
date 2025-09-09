// Test WebSocket connections to both BCA (general) and BCOM rooms
console.log('Testing WebSocket connections...');

// Test BCA (general) room connection
console.log('\n1. Testing BCA (general) room connection...');
const ws1 = new WebSocket('ws://127.0.0.1:5002/chat?username=TestUser&room=general');

ws1.onopen = () => {
  console.log('✅ BCA (general) room connected successfully');
  ws1.close();
};

ws1.onerror = (error) => {
  console.log('❌ BCA (general) room connection failed:', error.message);
};

ws1.onclose = () => {
  console.log('🔌 BCA (general) room connection closed');
};

// Test BCOM room connection
console.log('\n2. Testing BCOM room connection...');
const ws2 = new WebSocket('ws://127.0.0.1:5002/chat?username=TestUser&room=bcom');

ws2.onopen = () => {
  console.log('✅ BCOM room connected successfully');
  ws2.close();
};

ws2.onerror = (error) => {
  console.log('❌ BCOM room connection failed:', error.message);
};

ws2.onclose = () => {
  console.log('🔌 BCOM room connection closed');
};

// Keep the process alive for a few seconds to see results
setTimeout(() => {
  console.log('\nTest completed.');
}, 5000);