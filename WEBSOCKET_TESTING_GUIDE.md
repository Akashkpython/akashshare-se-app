# WebSocket Testing Guide

This guide provides comprehensive testing steps for the Akash Share WebSocket functionality.

## Prerequisites

1. Ensure the backend server is running on port 5002
2. MongoDB connection is established
3. All dependencies are installed

## Testing Steps

### 1. Backend Server Test

First, verify the backend server is running:

```bash
# Check if backend is running
curl http://localhost:5002/health

# Expected response:
# {"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. WebSocket Server Test

Run the automated WebSocket test:

```bash
# Run the test script
node test-websocket.js

# Expected output:
# ✅ WebSocket connection established
# 📥 Received message #1: userList
# 📤 Sending test message...
# 📥 Received message #2: message
# 🔄 Testing room switch...
# 📥 Received message #3: roomSwitched
# 📤 Sending message in new room...
# 📥 Received message #4: message
# 🔌 Closing connection...
# 
# 📊 Test Results:
#    Connection: ✅
#    User List: ✅
#    Message: ✅
#    Room Switch: ✅
# 
# 🎯 Overall: 4/4 tests passed
# 🎉 All tests passed! WebSocket server is working correctly.
```

### 3. Electron App Test

1. Start the Electron app:
   ```bash
   npm run electron
   ```

2. Navigate to Group Chat page

3. Verify the following:
   - ✅ Connection status shows "Connected"
   - ✅ Online users list updates
   - ✅ Messages can be sent and received
   - ✅ Room switching works without connection loss
   - ✅ Reconnection works after network interruption

### 4. Manual Testing Scenarios

#### Scenario 1: Basic Connection
1. Open Group Chat
2. Verify connection establishes automatically
3. Check that username appears in online users list
4. Send a test message
5. Verify message appears in chat

#### Scenario 2: Room Switching
1. Start in "General" room
2. Switch to "Help & Support" room
3. Verify messages are cleared
4. Send a message in the new room
5. Switch back to "General"
6. Verify room-specific messages are maintained

#### Scenario 3: Multiple Users
1. Open multiple browser tabs/windows
2. Each should show different usernames
3. Send messages from different tabs
4. Verify all users see all messages
5. Verify online user count updates correctly

#### Scenario 4: Connection Recovery
1. Disconnect network temporarily
2. Verify reconnection attempts with exponential backoff
3. Reconnect network
4. Verify connection is restored
5. Verify messages can be sent/received again

#### Scenario 5: Error Handling
1. Try sending empty messages (should be ignored)
2. Try sending very long messages (should be rejected)
3. Try switching to invalid room names (should show error)
4. Verify error messages are user-friendly

### 5. Performance Testing

#### Load Test
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test (create artillery.yml first)
artillery run artillery.yml
```

#### Memory Test
1. Leave the chat open for extended periods
2. Monitor memory usage in task manager
3. Verify no memory leaks occur
4. Test with multiple room switches

### 6. Error Scenarios

#### Backend Server Down
1. Stop the backend server
2. Verify connection shows "Disconnected"
3. Verify reconnection attempts
4. Restart backend server
5. Verify connection is restored

#### Network Issues
1. Disconnect network
2. Verify connection status updates
3. Reconnect network
4. Verify automatic reconnection

#### Invalid Messages
1. Try sending malformed JSON
2. Try sending messages without required fields
3. Verify server handles gracefully

## Expected Outcomes

### ✅ Success Criteria
1. WebSocket connections establish and remain open
2. Messages can be sent and received by all users
3. Online user list updates in real-time
4. Room switching works without connection loss
5. Error handling provides clear feedback to users
6. Reconnection works automatically with exponential backoff
7. No memory leaks during extended use
8. Backend process management works correctly

### ❌ Common Issues and Solutions

#### Connection Refused
- **Issue**: `ECONNREFUSED` error
- **Solution**: Ensure backend server is running on port 5002

#### Port Already in Use
- **Issue**: `EADDRINUSE` error
- **Solution**: Kill existing processes on port 5002 or change port

#### MongoDB Connection Failed
- **Issue**: `MongoNetworkError`
- **Solution**: Check MONGO_URI in backend .env file

#### Messages Not Appearing
- **Issue**: Messages sent but not received
- **Solution**: Check WebSocket connection status and room membership

#### Room Switch Fails
- **Issue**: Room switch doesn't work
- **Solution**: Verify room name validation and WebSocket message format

## Debugging

### Enable Debug Logging
```bash
# Set debug environment variable
export DEBUG=*
npm run electron
```

### Check Backend Logs
```bash
# View backend server logs
tail -f backend/logs/server.log
```

### Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by WS (WebSocket)
4. Monitor connection status and messages

### Electron DevTools
1. Open DevTools in Electron app
2. Check Console for WebSocket logs
3. Monitor connection state changes

## Troubleshooting

### Backend Won't Start
1. Check if port 5002 is available
2. Verify MongoDB connection
3. Check .env file configuration
4. Ensure all dependencies are installed

### WebSocket Connection Fails
1. Verify backend server is running
2. Check firewall settings
3. Verify URL format: `ws://localhost:5002/chat`
4. Check username and room parameter encoding

### Messages Not Synchronizing
1. Verify all clients are in the same room
2. Check WebSocket connection status
3. Verify message format and validation
4. Check for JavaScript errors in console

## Performance Benchmarks

### Expected Performance
- Connection establishment: < 2 seconds
- Message delivery: < 100ms
- Room switching: < 500ms
- Reconnection: < 5 seconds (with backoff)

### Resource Usage
- Memory usage: < 50MB per connection
- CPU usage: < 5% during normal operation
- Network: < 1KB per message

## Security Considerations

### Input Validation
- Usernames are sanitized (max 50 characters)
- Messages are sanitized (max 1000 characters)
- Room names are validated and sanitized
- XSS protection through input sanitization

### Rate Limiting
- Message rate limiting implemented
- Connection rate limiting configured
- Automatic cleanup of inactive connections

### Error Information
- Detailed errors logged server-side
- User-friendly errors sent to clients
- No sensitive information exposed to clients
