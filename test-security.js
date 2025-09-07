import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 AkashShare Security Implementation Test');
console.log('==========================================\n');

// Test 1: Environment Variables Check
console.log('1. 📋 Environment Variables Check:');
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'PORT',
  'FILE_SIZE_LIMIT',
  'ALLOWED_FILE_TYPES'
];

let envScore = 0;
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value && value !== 'YOUR_PLACEHOLDER_VALUE') {
    console.log(`   ✅ ${envVar}: Set`);
    envScore++;
  } else {
    console.log(`   ❌ ${envVar}: Missing or placeholder`);
  }
});
console.log(`   Score: ${envScore}/${requiredEnvVars.length}\n`);

// Test 2: File Structure Check
console.log('2. 📁 Security Files Check:');
const securityFiles = [
  'backend/utils/fileValidation.js',
  'backend/utils/websocketRateLimit.js',
  'backend/utils/errorHandler.js',
  'backend/mongo-connection.js',
  '.env.production'
];

let fileScore = 0;
securityFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}: Exists`);
    fileScore++;
  } else {
    console.log(`   ❌ ${file}: Missing`);
  }
});
console.log(`   Score: ${fileScore}/${securityFiles.length}\n`);

// Test 3: Hardcoded Credentials Check
console.log('3. 🔍 Hardcoded Credentials Check:');
const filesToCheck = [
  '.env.example',
  'backend/.env.render',
  'electron/main.js'
];

let credentialScore = 0;
const dangerousPatterns = [
  /mongodb\+srv:\/\/[^:]+:[^@]+@/,
  /jwt_secret.*[a-f0-9]{32,}/i,
  /password.*[^placeholder]/i
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    let hasDangerousContent = false;
    
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasDangerousContent = true;
      }
    });
    
    if (!hasDangerousContent) {
      console.log(`   ✅ ${file}: No hardcoded credentials`);
      credentialScore++;
    } else {
      console.log(`   ❌ ${file}: Contains hardcoded credentials`);
    }
  } else {
    console.log(`   ⚠️  ${file}: File not found`);
  }
});
console.log(`   Score: ${credentialScore}/${filesToCheck.length}\n`);

// Test 4: Security Utilities Check
console.log('4. 🛡️  Security Utilities Check:');
const utilityChecks = [
  {
    file: 'backend/utils/fileValidation.js',
    functions: ['validateFileSignature', 'sanitizeFilename', 'enhancedFileValidation']
  },
  {
    file: 'backend/utils/websocketRateLimit.js',
    functions: ['recordConnectionAttempt', 'isRateLimited', 'incrementConnectionCount']
  },
  {
    file: 'backend/utils/errorHandler.js',
    functions: ['asyncErrorHandler', 'globalErrorHandler', 'validateEnvironment']
  }
];

let utilityScore = 0;
let totalUtilityChecks = 0;

utilityChecks.forEach(check => {
  const filePath = path.join(__dirname, check.file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    check.functions.forEach(func => {
      totalUtilityChecks++;
      if (content.includes(func)) {
        console.log(`   ✅ ${func}: Found in ${check.file}`);
        utilityScore++;
      } else {
        console.log(`   ❌ ${func}: Missing in ${check.file}`);
      }
    });
  }
});
console.log(`   Score: ${utilityScore}/${totalUtilityChecks}\n`);

// Overall Security Score
const totalScore = envScore + fileScore + credentialScore + utilityScore;
const maxScore = requiredEnvVars.length + securityFiles.length + filesToCheck.length + totalUtilityChecks;
const percentage = Math.round((totalScore / maxScore) * 100);

console.log('🎯 Overall Security Score:');
console.log(`   ${totalScore}/${maxScore} (${percentage}%)`);

if (percentage >= 90) {
  console.log('   🟢 EXCELLENT - Production Ready!');
} else if (percentage >= 75) {
  console.log('   🟡 GOOD - Minor issues to address');
} else if (percentage >= 50) {
  console.log('   🟠 FAIR - Several issues need attention');
} else {
  console.log('   🔴 POOR - Critical issues must be fixed');
}

console.log('\n📋 Next Steps:');
console.log('1. Update .env.production with your actual MongoDB URI');
console.log('2. Generate and set a secure JWT_SECRET');
console.log('3. Test file upload functionality');
console.log('4. Test WebSocket connections');
console.log('5. Deploy to production environment');
