import mongoose from 'mongoose';

// Test MongoDB connection
async function testMongoConnection() {
  const mongoUri = 'mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare';
  
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI:', mongoUri);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB successfully');
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
  }
}

testMongoConnection();