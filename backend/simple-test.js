import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env' });

console.log('🔍 Testing MongoDB Connection...');
console.log('🔗 MONGO_URI is set:', !!process.env.MONGO_URI);

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

console.log('🔗 Attempting to connect to MongoDB...');

// Try to connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // 5 seconds
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
  return mongoose.connection.close();
})
.then(() => {
  console.log('🔒 Connection closed.');
  console.log('🎉 Test completed successfully!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:');
  console.error('   Error:', err.message);
  process.exit(1);
});