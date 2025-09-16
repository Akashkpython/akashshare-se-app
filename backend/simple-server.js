import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;

app.get('/', (req, res) => {
  res.json({ 
    message: "Simple test server running",
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log(`🔍 Health endpoint: http://localhost:${PORT}/health`);
});