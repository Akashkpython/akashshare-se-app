// Middleware for tracking HTTP connections in the connection pool
import { httpConnectionPool } from '../utils/connectionPool.js';

export const trackConnection = (req, res, next) => {
  const connectionId = `http_${req.ip}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  
  try {
    // Create connection entry
    httpConnectionPool.createConnection(connectionId, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      startTime
    });
    
    // Add connection info to request
    req.connectionId = connectionId;
    req.connectionPool = httpConnectionPool;
    
    // Track response completion
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Update connection metadata
      httpConnectionPool.updateConnectionActivity(connectionId, {
        requests: 1,
        dataTransferred: Buffer.byteLength(data || '', 'utf8'),
        responseTime: duration
      });
      
      // Mark as idle and schedule for cleanup
      setTimeout(() => {
        httpConnectionPool.markConnectionIdle(connectionId);
      }, 1000);
      
      // Call original send
      return originalSend.call(this, data);
    };
    
    // Handle errors
    res.on('error', () => {
      httpConnectionPool.updateConnectionActivity(connectionId, { errors: 1 });
    });
    
    // Handle connection close
    req.on('close', () => {
      httpConnectionPool.destroyConnection(connectionId, 'client_disconnect');
    });
    
    next();
  } catch (error) {
    // If connection pool is full, continue without tracking
    console.warn(`⚠️ Connection tracking failed: ${error.message}`);
    next();
  }
};

export const trackWebSocketConnection = (ws, req, room = 'general') => {
  const connectionId = `ws_${req.ip}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  try {
    // Use the imported wsConnectionPool directly
    import('../utils/connectionPool.js').then(({ wsConnectionPool }) => {
      wsConnectionPool.createWebSocketConnection(connectionId, ws, room, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        room
      });
      
      // Track WebSocket events
      ws.on('message', (data) => {
        wsConnectionPool.updateConnectionActivity(connectionId, {
          requests: 1,
          dataTransferred: Buffer.byteLength(data)
        });
      });
      
      ws.on('error', () => {
        wsConnectionPool.updateConnectionActivity(connectionId, { errors: 1 });
      });
      
      ws.on('close', () => {
        wsConnectionPool.destroyConnection(connectionId, 'websocket_close');
      });
    }).catch(error => {
      console.warn(`⚠️ WebSocket connection tracking failed: ${error.message}`);
    });
    
    // Add connection ID to WebSocket for reference
    ws.connectionId = connectionId;
    
    return connectionId;
  } catch (error) {
    console.warn(`⚠️ WebSocket connection tracking failed: ${error.message}`);
    return null;
  }
};
