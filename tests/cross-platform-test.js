#!/usr/bin/env node

// Cross-platform compatibility test suite
import { PathUtils, OSUtils, FileUtils, URLUtils, EnvUtils } from '../backend/utils/crossPlatform.js';
import fs from 'fs';
import path from 'path';

console.log('🧪 Cross-Platform Compatibility Test Suite');
console.log('===========================================');

let testsPassed = 0;
let testsFailed = 0;

function runTest(testName, testFunction) {
  try {
    const result = testFunction();
    if (result) {
      console.log(`✅ ${testName}`);
      testsPassed++;
    } else {
      console.log(`❌ ${testName} - Test returned false`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ ${testName} - Error: ${error.message}`);
    testsFailed++;
  }
}

// OS Detection Tests
console.log('\n🖥️ Operating System Detection Tests:');

runTest('OS Detection', () => {
  const os = OSUtils.getOS();
  const validOS = ['windows', 'macos', 'linux', 'other'];
  console.log(`   Detected OS: ${os}`);
  return validOS.includes(os);
});

runTest('Platform Checks', () => {
  const isWin = OSUtils.isWindows();
  const isMac = OSUtils.isMacOS();
  const isLinux = OSUtils.isLinux();
  console.log(`   Windows: ${isWin}, macOS: ${isMac}, Linux: ${isLinux}`);
  return typeof isWin === 'boolean' && typeof isMac === 'boolean' && typeof isLinux === 'boolean';
});

runTest('System Info', () => {
  const info = OSUtils.getSystemInfo();
  console.log(`   Platform: ${info.platform}, Arch: ${info.arch}, CPUs: ${info.cpus}`);
  return info.platform && info.arch && info.cpus > 0;
});

// Path Utilities Tests
console.log('\n📁 Path Utilities Tests:');

runTest('Path Normalization', () => {
  const testPaths = [
    'folder/subfolder/file.txt',
    'folder\\subfolder\\file.txt',
    'folder/../folder/file.txt',
    './folder/file.txt'
  ];
  
  for (const testPath of testPaths) {
    const normalized = PathUtils.normalize(testPath);
    console.log(`   ${testPath} → ${normalized}`);
  }
  return true;
});

runTest('Path Joining', () => {
  const joined = PathUtils.join('folder', 'subfolder', 'file.txt');
  console.log(`   Joined path: ${joined}`);
  return joined.includes('folder') && joined.includes('file.txt');
});

runTest('Unix Path Conversion', () => {
  const windowsPath = 'folder\\subfolder\\file.txt';
  const unixPath = PathUtils.toUnixPath(windowsPath);
  console.log(`   Windows → Unix: ${windowsPath} → ${unixPath}`);
  return unixPath === 'folder/subfolder/file.txt';
});

runTest('Platform Path Conversion', () => {
  const testPath = 'folder/subfolder/file.txt';
  const platformPath = PathUtils.toPlatformPath(testPath);
  console.log(`   Platform path: ${platformPath}`);
  return typeof platformPath === 'string';
});

runTest('Safe File Path Creation', () => {
  const unsafeFilename = 'file<>:"/\\|?*.txt';
  const safePath = PathUtils.createSafeFilePath(unsafeFilename, 'uploads');
  console.log(`   Unsafe → Safe: ${unsafeFilename} → ${safePath}`);
  return !safePath.includes('<') && !safePath.includes('>');
});

// File Utilities Tests
console.log('\n📄 File Utilities Tests:');

runTest('Directory Creation', () => {
  const testDir = PathUtils.join('test-temp-dir', 'subdir');
  const created = FileUtils.createDir(testDir);
  
  if (created) {
    // Cleanup
    try {
      fs.rmSync('test-temp-dir', { recursive: true, force: true });
    } catch (e) {
      console.log(`   Warning: Could not clean up test directory: ${e.message}`);
    }
  }
  
  console.log(`   Directory creation: ${created}`);
  return created;
});

runTest('File Existence Check', () => {
  // Test with current file
  const exists = FileUtils.exists(__filename);
  console.log(`   Current file exists: ${exists}`);
  return exists;
});

runTest('File Stats', () => {
  const stats = FileUtils.getStats(__filename);
  const size = FileUtils.getFileSize(__filename);
  console.log(`   File size: ${size} bytes`);
  return stats !== null && size > 0;
});

// URL Utilities Tests
console.log('\n🌐 URL Utilities Tests:');

runTest('File Path to URL', () => {
  const filePath = 'folder\\subfolder\\file.txt';
  const urlPath = URLUtils.filePathToURL(filePath);
  console.log(`   File → URL: ${filePath} → ${urlPath}`);
  return urlPath === 'folder/subfolder/file.txt';
});

runTest('URL Path Joining', () => {
  const joined = URLUtils.joinURL('/api', 'files', 'download');
  console.log(`   URL joined: ${joined}`);
  return joined === '/api/files/download';
});

// Environment Utilities Tests
console.log('\n🌍 Environment Utilities Tests:');

runTest('Environment Detection', () => {
  const isDev = EnvUtils.isDevelopment();
  const isProd = EnvUtils.isProduction();
  const isTest = EnvUtils.isTest();
  console.log(`   Development: ${isDev}, Production: ${isProd}, Test: ${isTest}`);
  return typeof isDev === 'boolean';
});

runTest('Port Detection', () => {
  const port = EnvUtils.getPort(3000);
  console.log(`   Default port: ${port}`);
  return typeof port === 'number' && port > 0;
});

// Cross-Platform Specific Tests
console.log('\n🔄 Cross-Platform Specific Tests:');

runTest('Line Endings', () => {
  const lineEnding = OSUtils.getLineEnding();
  console.log(`   Line ending: ${JSON.stringify(lineEnding)}`);
  return lineEnding === '\r\n' || lineEnding === '\n';
});

runTest('Executable Extension', () => {
  const ext = OSUtils.getExecutableExtension();
  console.log(`   Executable extension: "${ext}"`);
  return (OSUtils.isWindows() && ext === '.exe') || (!OSUtils.isWindows() && ext === '');
});

runTest('Path Separator', () => {
  const sep = OSUtils.getPathSeparator();
  console.log(`   Path separator: "${sep}"`);
  return sep === ';' || sep === ':';
});

// Real-world Scenario Tests
console.log('\n🎯 Real-World Scenario Tests:');

runTest('Upload Path Generation', () => {
  const filename = 'My Document (Copy).pdf';
  const safePath = PathUtils.createSafeFilePath(filename, 'uploads');
  const normalized = PathUtils.normalize(safePath);
  console.log(`   Upload path: ${normalized}`);
  return normalized.includes('uploads') && !normalized.includes('(') && !normalized.includes(')');
});

runTest('Cross-Platform File Operations', () => {
  const testFile = PathUtils.join('test-cross-platform.txt');
  
  try {
    // Create test file
    fs.writeFileSync(testFile, 'Cross-platform test content');
    
    // Test file operations
    const exists = FileUtils.exists(testFile);
    const size = FileUtils.getFileSize(testFile);
    const deleted = FileUtils.deleteFile(testFile);
    
    console.log(`   File ops - Exists: ${exists}, Size: ${size}, Deleted: ${deleted}`);
    return exists && size > 0 && deleted;
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    return false;
  }
});

// Summary
console.log('\n===========================================');
console.log(`📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log(`🖥️ Current Platform: ${OSUtils.getOS()}`);
console.log(`📍 Working Directory: ${process.cwd()}`);
console.log(`🗂️ Temp Directory: ${OSUtils.getTempDir()}`);
console.log(`🏠 Home Directory: ${OSUtils.getHomeDir()}`);

if (testsFailed === 0) {
  console.log('\n🎉 All cross-platform tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️ Some cross-platform tests failed. Check compatibility.');
  process.exit(1);
}
