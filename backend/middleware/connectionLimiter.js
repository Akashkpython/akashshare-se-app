/**
 * Connection limiting middleware for WebSocket and HTTP connections
 * Prevents resource exhaustion and improves performance
 */

class ConnectionLimiter {
  constructor(options = {}) {
    this.maxConnections = options.maxConnections || 100;
    this.maxConnectionsPerIP = options.maxConnectionsPerIP || 10;
    this.connections = new Map();
    this.ipConnections = new Map();
    this.connectionTimeout = options.connectionTimeout || 30000; // 30 seconds
    
    // Cleanup stale connections every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Track a new connection
   */
  trackConnection(connectionId, ip, metadata = {}) {
    const now = Date.now();
    
    // Check global connection limit
    if (this.connections.size >= this.maxConnections) {
      throw new Error('Server connection limit reached');
    }
    
    // Check per-IP connection limit
    const ipConnCount = this.ipConnections.get(ip) || 0;
    if (ipConnCount >= this.maxConnectionsPerIP) {
      throw new Error('IP connection limit reached');
    }
    
    // Track connection
    this.connections.set(connectionId, {
      ip,
      connectedAt: now,
      lastActivity: now,
      ...metadata
    });
    
    // Update IP connection count
    this.ipConnections.set(ip, ipConnCount + 1);
    
    return connectionId;
  }

  /**
   * Update connection activity
   */
  updateActivity(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = Date.now();
    }
  }

  /**
   * Remove a connection
   */
  removeConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      
      // Update IP connection count
      const ipCount = this.ipConnections.get(connection.ip) || 0;
      if (ipCount <= 1) {
        this.ipConnections.delete(connection.ip);
      } else {
        this.ipConnections.set(connection.ip, ipCount - 1);
      }
    }
  }

  /**
   * Cleanup stale connections
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [connectionId, connection] of this.connections) {
      if (now - connection.lastActivity > this.connectionTimeout) {
        this.removeConnection(connectionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} stale connections`);
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const now = Date.now();
    const activeConnections = Array.from(this.connections.values());
    
    return {
      totalConnections: this.connections.size,
      uniqueIPs: this.ipConnections.size,
      maxConnections: this.maxConnections,
      maxConnectionsPerIP: this.maxConnectionsPerIP,
      averageConnectionAge: activeConnections.length > 0 
        ? activeConnections.reduce((sum, conn) => sum + (now - conn.connectedAt), 0) / activeConnections.length
        : 0,
      oldestConnection: activeConnections.length > 0
        ? Math.min(...activeConnections.map(conn => conn.connectedAt))
        : null
    };
  }

  /**
   * Express middleware for HTTP connection limiting
   */
  httpMiddleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const connectionId = `http_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        this.trackConnection(connectionId, ip, { type: 'http', path: req.path });
        
        // Cleanup on response end
        res.on('finish', () => {
          this.removeConnection(connectionId);
        });
        
        next();
      } catch (error) {
        res.status(429).json({
          error: error.message,
          retryAfter: 60
        });
      }
    };
  }

  /**
   * Check if IP can connect
   */
  canConnect(ip) {
    const ipConnCount = this.ipConnections.get(ip) || 0;
    return this.connections.size < this.maxConnections && 
           ipConnCount < this.maxConnectionsPerIP;
  }
}

export default ConnectionLimiter;
