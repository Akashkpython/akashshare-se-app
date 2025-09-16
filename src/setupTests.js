// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock WebSocket for tests
global.WebSocket = class WebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    
    // Simulate connection
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }
  
  send(_data) {
    // Mock send
  }
  
  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose();
  }
};

// Mock electron API
global.window = global.window || {};
global.window.electronAPI = {
  selectFiles: () => Promise.resolve([]),
  selectSaveDirectory: () => Promise.resolve(null),
  showNotification: () => Promise.resolve(),
  platform: 'win32',
  appVersion: '1.0.0',
  minimize: () => Promise.resolve(),
  maximize: () => Promise.resolve(),
  close: () => Promise.resolve(),
  checkForUpdates: () => Promise.resolve(),
  downloadUpdate: () => Promise.resolve(),
  quitAndInstall: () => Promise.resolve(),
  onUpdateStatus: () => {},
  removeUpdateStatusListener: () => {},
  onWindowStateChange: () => {}
};

// Mock fetch for tests
global.fetch = global.fetch || (() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve('')
}));

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || args[0].includes('DeprecationWarning'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};