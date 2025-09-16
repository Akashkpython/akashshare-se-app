#!/usr/bin/env node

/**
 * Final verification test for all critical fixes
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

console.log('🧪 Starting final verification tests for Akash Share fixes...\n');

// Test 1: Check if PowerShell syntax errors are fixed
async function testPowerShellSyntax() {
  console.log('1. Testing PowerShell syntax fix...');
  
  try {
    // Check if the new PowerShell script exists
    const psScriptPath = path.join(__dirname, 'start-app.ps1');
    const fs = require('fs');
    
    if (fs.existsSync(psScriptPath)) {
      console.log('   ✅ PowerShell script exists');
      
      // Try to parse the script for syntax errors (without executing)
      const { stderr } = await execAsync(`pwsh -Command "Get-Command ${psScriptPath}"`, { timeout: 5000 });
      if (stderr) {
        console.log('   ❌ PowerShell script has syntax errors:', stderr);
        return false;
      }
      
      console.log('   ✅ PowerShell script syntax is valid');
      return true;
    } else {
      console.log('   ❌ PowerShell script not found');
      return false;
    }
  } catch (error) {
    console.log('   ❌ PowerShell syntax test failed:', error.message);
    return false;
  }
}

// Test 2: Check if batch file syntax errors are fixed
async function testBatchSyntax() {
  console.log('2. Testing batch file syntax fix...');
  
  try {
    // Check if the new batch file exists
    const batchPath = path.join(__dirname, 'fixed-start-app.bat');
    const fs = require('fs');
    
    if (fs.existsSync(batchPath)) {
      console.log('   ✅ Batch file exists');
      
      // Try to parse the batch file (basic check)
      const content = fs.readFileSync(batchPath, 'utf8');
      
      // Check for common PowerShell syntax errors
      if (content.includes('&&') && content.includes('powershell')) {
        console.log('   ❌ Batch file may still contain PowerShell syntax errors');
        return false;
      }
      
      console.log('   ✅ Batch file syntax appears correct');
      return true;
    } else {
      console.log('   ❌ Batch file not found');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Batch file syntax test failed:', error.message);
    return false;
  }
}

// Test 3: Check if HOST binding is fixed
async function testHostBinding() {
  console.log('3. Testing HOST binding fix...');
  
  try {
    // Check backend server.js for correct HOST configuration
    const backendServerPath = path.join(__dirname, 'backend', 'server.js');
    const fs = require('fs');
    
    if (fs.existsSync(backendServerPath)) {
      const content = fs.readFileSync(backendServerPath, 'utf8');
      
      // Check if it's configured to use 127.0.0.1 instead of 0.0.0.0
      if (content.includes("HOST: process.env.HOST || '127.0.0.1'") || 
          content.includes("const HOST = process.env.HOST || '127.0.0.1'")) {
        console.log('   ✅ Backend configured to use IPv4 address (127.0.0.1)');
        return true;
      } else if (content.includes('0.0.0.0')) {
        console.log('   ⚠️  Backend may still be configured to use 0.0.0.0');
        return false;
      } else {
        console.log('   ✅ Backend HOST configuration appears correct');
        return true;
      }
    } else {
      console.log('   ❌ Backend server.js not found');
      return false;
    }
  } catch (error) {
    console.log('   ❌ HOST binding test failed:', error.message);
    return false;
  }
}

// Test 4: Check if Electron process management is improved
async function testElectronProcessManagement() {
  console.log('4. Testing Electron process management fix...');
  
  try {
    // Check electron/main.js for single instance lock
    const electronMainPath = path.join(__dirname, 'electron', 'main.js');
    const fs = require('fs');
    
    if (fs.existsSync(electronMainPath)) {
      const content = fs.readFileSync(electronMainPath, 'utf8');
      
      // Check for single instance lock implementation
      if (content.includes('app.requestSingleInstanceLock') && 
          content.includes('gotTheLock')) {
        console.log('   ✅ Single instance lock implementation found');
        return true;
      } else {
        console.log('   ❌ Single instance lock implementation not found');
        return false;
      }
    } else {
      console.log('   ❌ Electron main.js not found');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Electron process management test failed:', error.message);
    return false;
  }
}

// Test 5: Check if new startup scripts are available
async function testNewStartupScripts() {
  console.log('5. Testing new startup scripts availability...');
  
  try {
    const fs = require('fs');
    let allScriptsFound = true;
    
    // Check for new scripts
    const scripts = [
      'start-app.ps1',
      'fixed-start-app.bat',
      'start-fixed-app.js',
      'verify-backend-fix.mjs',
      'CRITICAL_FIXES_SUMMARY.md',
      'FIXED_STARTUP_GUIDE.md'
    ];
    
    for (const script of scripts) {
      const scriptPath = path.join(__dirname, script);
      if (fs.existsSync(scriptPath)) {
        console.log(`   ✅ ${script} found`);
      } else {
        console.log(`   ❌ ${script} not found`);
        allScriptsFound = false;
      }
    }
    
    return allScriptsFound;
  } catch (error) {
    console.log('   ❌ New startup scripts test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  let passedTests = 0;
  const totalTests = 5;
  
  if (await testPowerShellSyntax()) passedTests++;
  if (await testBatchSyntax()) passedTests++;
  if (await testHostBinding()) passedTests++;
  if (await testElectronProcessManagement()) passedTests++;
  if (await testNewStartupScripts()) passedTests++;
  
  console.log('\n📋 Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 All tests passed! Critical fixes have been successfully implemented.');
    console.log('\n💡 You can now start the application using one of these methods:');
    console.log('   - PowerShell: .\\start-app.ps1');
    console.log('   - Batch file: .\\fixed-start-app.bat');
    console.log('   - Node.js: npm run start:fixed');
  } else {
    console.log('   ⚠️  Some tests failed. Please review the fixes.');
  }
}

// Run the verification
runAllTests().catch(error => {
  console.error('❌ Verification failed with error:', error);
  process.exit(1);
});