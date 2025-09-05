// Test script to add a file to database for testing download functionality
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// File Schema (same as in server.js)
const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  originalName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  path: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 10
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now,
    expires: 24 * 60 * 60 * 1000 // Auto-delete after 24 hours
  }
});

const File = mongoose.model("File", FileSchema);

async function addTestFile() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected successfully");

    // Create test file content
    const testFileName = "test-file.txt";
    const testFileContent = "This is a test file for download functionality testing.";
    const testFilePath = path.join(__dirname, "uploads", testFileName);
    
    // Ensure uploads directory exists
    const uploadsDir = path.dirname(testFilePath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create the test file
    fs.writeFileSync(testFilePath, testFileContent);
    console.log("📁 Test file created:", testFilePath);

    // Generate a 4-digit test code
    const testCode = "5678";
    
    // Create database entry
    const testFile = new File({
      filename: testFileName,
      originalName: "test-file.txt",
      path: testFilePath,
      code: testCode,
      size: testFileContent.length,
      mimetype: "text/plain"
    });
    
    // Save to database
    await testFile.save();
    console.log(`✅ Test file saved with code: ${testCode}`);
    console.log(`📋 Test file details:`, {
      name: testFile.originalName,
      size: testFile.size,
      code: testFile.code,
      path: testFile.path
    });
    
    console.log(`\n🎯 TEST INSTRUCTIONS:`);
    console.log(`1. Open frontend at http://localhost:3000`);
    console.log(`2. Go to Receive Files page`);
    console.log(`3. Enter code: ${testCode}`);
    console.log(`4. Test download functionality`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    mongoose.disconnect();
  }
}

addTestFile();