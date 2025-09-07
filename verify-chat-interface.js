/**
 * Script to verify which chat interface is being used in the Electron app
 * Run this in the browser console when the chat page is loaded
 */

function verifyChatInterface() {
  console.log('=== Chat Interface Verification ===');
  
  // Check environment
  const isElectron = navigator.userAgent.includes('Electron');
  const isReactApp = document.getElementById('root') !== null;
  const isFileProtocol = window.location.protocol === 'file:';
  const isHttpProtocol = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  
  console.log('Environment Info:');
  console.log('- Running in Electron:', isElectron);
  console.log('- Is React App:', isReactApp);
  console.log('- Protocol:', window.location.protocol);
  console.log('- Hostname:', window.location.hostname);
  console.log('- Pathname:', window.location.pathname);
  
  // Check for specific elements
  const hasReactElements = document.querySelector('[data-reactroot]') || document.querySelector('[data-reactid]');
  const hasTestPageMarker = document.body.textContent.includes('Standalone HTML Page') || document.title.includes('Test');
  const hasReactComponentMarker = document.body.textContent.includes('React Component') || document.body.textContent.includes('Correct for Electron');
  
  console.log('Element Detection:');
  console.log('- Has React elements:', !!hasReactElements);
  console.log('- Is Test Page:', hasTestPageMarker);
  console.log('- Is React Component:', hasReactComponentMarker);
  
  // Determine interface
  let interfaceType = 'Unknown';
  let isCorrect = false;
  
  if (isElectron && isReactApp && hasReactComponentMarker) {
    interfaceType = 'Electron React Component (CORRECT)';
    isCorrect = true;
  } else if (isFileProtocol && hasTestPageMarker) {
    interfaceType = 'Standalone HTML Test Page (INCORRECT for Electron)';
  } else if (isHttpProtocol && isReactApp) {
    interfaceType = 'Web React App';
  } else {
    interfaceType = 'Unknown Interface';
  }
  
  console.log('=== VERIFICATION RESULT ===');
  console.log('Interface Type:', interfaceType);
  console.log('Is Correct Interface for Electron:', isCorrect);
  
  // Visual feedback in console
  if (isCorrect) {
    console.log('%c✅ SUCCESS: You are using the CORRECT React GroupChat component in the Electron app', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
  } else {
    console.log('%c⚠️ WARNING: You are NOT using the correct interface for the Electron app', 'color: #FF9800; font-weight: bold; font-size: 16px;');
    if (interfaceType.includes('Test Page')) {
      console.log('%cPlease navigate to the correct React GroupChat component in your Electron app', 'color: #F44336; font-weight: bold;');
    }
  }
  
  return {
    isElectron,
    isReactApp,
    protocol: window.location.protocol,
    interfaceType,
    isCorrect
  };
}

// Run the verification
verifyChatInterface();

// Also export for manual execution
window.verifyChatInterface = verifyChatInterface;

console.log('To run verification again, type: verifyChatInterface() in the console');