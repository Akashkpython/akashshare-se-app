const mongoose = require('mongoose');
require('dotenv').config();

// Use the MongoDB Atlas connection string from environment variables
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/akashshare?retryWrites=true&w=majority';

console.log('Testing MongoDB Atlas connection...');
console.log('Connection string:', mongoUri.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

mongoose.connect(mongoUri)
.then(() => {
  console.log('✅ Successfully connected to MongoDB Atlas');
  
  // Test by getting database info
  const db = mongoose.connection;
  console.log('Database name:', db.name);
  
  // Close connection
  mongoose.connection.close();
  console.log('🔒 Connection closed');
})
.catch(err => {
  console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
  process.exit(1);
});