// Simple test server to check port 5002
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is working on port 5002!\n');
});

const PORT = 5002;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Test server running on ${HOST}:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});