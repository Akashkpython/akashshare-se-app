# WebSocket Implementation Summary

This document provides a comprehensive overview of the WebSocket implementation in the Akash Share application, including its architecture, key components, and current status.

## Architecture Overview

The WebSocket implementation in Akash Share follows a modular architecture with the following key components:

1. **Backend Server** ([backend/server.js](file:///D:/5th%20sem/project/akashshare-se/backend/server.js)) - Main Express server with WebSocket integration
2. **Group Chat Utility** ([backend/utils/group.js](file:///D:/5th%20sem/project/akashshare-se/backend/utils/group.js)) - Core WebSocket group chat functionality
3. **WebSocket Rate Limiting** ([backend/utils/websocketRateLimit.js](file:///D:/5th%20sem/project/akashshare-se/backend/utils/websocketRateLimit.js)) - Connection management and rate limiting
4. **Frontend Implementation** ([src/pages/GroupChatWhatsApp.js](file:///D:/5th%20sem/project/akashshare-se/src/pages/GroupChatWhatsApp.js)) - React component for WebSocket-based chat
5. **Environment Configuration** ([src/config/environment.js](file:///D:/5th%20sem/project/akashshare-se/src/config/environment.js)) - WebSocket URL generation

## Key Components

### 1. Backend WebSocket Server

The WebSocket server is implemented in [backend/server.js](file:///D:/5th%20sem/project/akashshare-se/backend/server.js) using the `ws` library:

```javascript
import { WebSocketServer } from "ws";
import http from "http";

const server = http.createServer({ family: 4 }, app);
const wss = new WebSocketServer({ server, path: '/chat' });

// Initialize group chat functionality
initializeGroupChat(wss);
```

Key features:
- Explicit IPv4 binding to avoid `::1` binding issues
- Path-based routing (`/chat`)
- Integration with group chat functionality

### 2. Group Chat Functionality

The core group chat logic is implemented in [backend/utils/group.js](file:///D:/5th%20sem/project/akashshare-se/backend/utils/group.js):

```javascript
export function initializeGroupChat(wss) {
  wss.on('connection', (ws, req) => {
    // Handle new connections
    // Parse URL parameters (username, room)
    // Manage room membership
    // Handle incoming messages
    // Broadcast to rooms
  });
}
```

Features:
- Room-based chat system
- User tracking and management
- Message broadcasting
- Connection lifecycle management (open, message, close, error)
- AI message moderation
- Room history management

### 3. WebSocket Rate Limiting

Connection management is handled in [backend/utils/websocketRateLimit.js](file:///D:/5th%20sem/project/akashshare-se/backend/utils/websocketRateLimit.js):

```javascript
export function isRateLimited(clientIP) { /* ... */ }
export function recordConnectionAttempt(clientIP) { /* ... */ }
export function hasExceededConnectionLimit(clientIP) { /* ... */ }
```

Features:
- IP-based rate limiting (5 attempts per minute)
- Connection limits per IP (100 concurrent connections)
- Automatic cleanup of old rate limit data

### 4. Frontend WebSocket Client

The frontend implementation is in [src/pages/GroupChatWhatsApp.js](file:///D:/5th%20sem/project/akashshare-se/src/pages/GroupChatWhatsApp.js):

```javascript
const ws = new WebSocket(wsUrl);
ws.onopen = () => { /* ... */ };
ws.onmessage = (event) => { /* ... */ };
ws.onerror = (error) => { /* ... */ };
ws.onclose = () => { /* ... */ };
```

Features:
- Dynamic WebSocket URL generation based on environment
- Connection state management
- Message handling and display
- Error handling and reconnection logic
- User interface for chat interactions

### 5. Environment Configuration

WebSocket URLs are generated dynamically in [src/config/environment.js](file:///D:/5th%20sem/project/akashshare-se/src/config/environment.js):

```javascript
getWebSocketUrl: (username, room) => {
  return `ws://localhost:5002/chat?username=${encodeURIComponent(username)}&room=${room}`;
}
```

## WebSocket Message Types

The implementation supports several message types:

1. **message** - Text messages between users
2. **userJoined** - Notification when a user joins a room
3. **userLeft** - Notification when a user leaves a room
4. **userList** - Current list of users in a room
5. **roomSwitched** - Confirmation when a user switches rooms
6. **error** - Error messages
7. **moderation** - AI moderation notifications

## Security Features

1. **Rate Limiting** - Prevents abuse through connection limits
2. **Message Moderation** - AI-based content filtering
3. **Input Validation** - Sanitization of message content and room names
4. **Connection Tracking** - Monitoring of active connections

## Testing

The WebSocket implementation includes comprehensive testing:

1. **Automated Tests** - [backend/test/websocket-client-test.js](file:///D:/5th%20sem/project/akashshare-se/backend/test/websocket-client-test.js)
2. **Manual Browser Tests** - [test-websocket-browser.html](file:///D:/5th%20sem/project/akashshare-se/test-websocket-browser.html)
3. **Integration Tests** - Part of the overall application testing suite

## Current Status

✅ **WebSocket functionality is working correctly**

Recent successful test output:
```
Connecting to ws://localhost:5002/chat?username=TestUser266&room=general...
✅ Connected to WebSocket server
📥 Received message: {
  type: 'userJoined',
  username: 'TestUser266',
  users: [ 'TestUser266' ],
  timestamp: '2025-09-14T08:21:33.403Z'
}
📥 Received message: { type: 'userList', users: [ 'TestUser266' ] }
📤 Sending message: {
  type: 'message',
  message: 'Hello from test client!',
  room: 'general'
}
📥 Received message: {
  type: 'message',
  username: 'TestUser266',
  message: 'Hello from test client!',
  room: 'general',
  timestamp: '2025-09-14T08:21:34.415Z'
}
✅ Test successful! Received our own message back.
```

## WebSocket URLs

- **Development**: `ws://localhost:5002/chat`
- **Production**: `ws://localhost:5002/chat` (same port as backend)

URL parameters:
- `username` - User identifier
- `room` - Chat room name

## Ports and Network Configuration

- **Backend Server**: Port 5002
- **Frontend**: Port 3000 (development) or same port as backend (production)
- **Binding**: Explicitly configured to use IPv4 (`0.0.0.0`) to avoid IPv6 issues

## Performance Considerations

1. **Memory Management** - Proper cleanup of connections and rate limit data
2. **Message Broadcasting** - Efficient room-based message distribution
3. **Connection Limits** - Prevents resource exhaustion
4. **Message Size Limits** - Prevents abuse through large messages (1000 character limit)

## Future Improvements

1. **Enhanced Rate Limiting Integration** - Fully integrate the rate limiting utilities
2. **Extended Message Types** - Support for file sharing notifications
3. **Improved Error Handling** - More detailed error messages and recovery
4. **Enhanced Security** - Additional authentication and authorization mechanisms