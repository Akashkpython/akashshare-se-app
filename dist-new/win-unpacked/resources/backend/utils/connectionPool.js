// Connection pooling and management utilities
import EventEmitter from 'events';

class ConnectionPool extends EventEmitter {
  constructor(options = {}) {
    super();
    this.maxConnections = options.maxConnections || 100;
    this.maxIdleTime = options.maxIdleTime || 30000; // 30 seconds
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute
    
    this.connections = new Map();
    this.connectionStats = {
      total: 0,
      active: 0,
      idle: 0,
      peak: 0,
      created: 0,
      destroyed: 0,
      rejected: 0
    };
    
    this.cleanupTimer = null;
    this.startCleanupTimer();
  }

  createConnection(id, connectionData = {}) {
    // Check if we're at max capacity
    if (this.connections.size >= this.maxConnections) {
      this.connectionStats.rejected++;
      throw new Error(`Connection pool full. Max connections: ${this.maxConnections}`);
    }

    const connection = {
      id,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      data: connectionData,
      metadata: {
        requests: 0,
        errors: 0,
        dataTransferred: 0
      }
    };

    this.connections.set(id, connection);
    this.connectionStats.total++;
    this.connectionStats.active++;
    this.connectionStats.created++;

    // Update peak if necessary
    if (this.connectionStats.active > this.connectionStats.peak) {
      this.connectionStats.peak = this.connectionStats.active;
    }

    console.log(`🔗 Connection created: ${id} (${this.connectionStats.active}/${this.maxConnections})`);
    this.emit('connectionCreated', connection);
    
    return connection;
  }

  getConnection(id) {
    const connection = this.connections.get(id);
    if (connection) {
      connection.lastActivity = Date.now();
      if (!connection.isActive) {
        connection.isActive = true;
        this.connectionStats.active++;
        this.connectionStats.idle--;
      }
    }
    return connection;
  }

  updateConnectionActivity(id, metadata = {}) {
    const connection = this.connections.get(id);
    if (connection) {
      connection.lastActivity = Date.now();
      
      // Update metadata
      if (metadata.requests) connection.metadata.requests += metadata.requests;
      if (metadata.errors) connection.metadata.errors += metadata.errors;
      if (metadata.dataTransferred) connection.metadata.dataTransferred += metadata.dataTransferred;
      
      this.emit('connectionActivity', connection);
    }
  }

  markConnectionIdle(id) {
    const connection = this.connections.get(id);
    if (connection && connection.isActive) {
      connection.isActive = false;
      connection.lastActivity = Date.now();
      this.connectionStats.active--;
      this.connectionStats.idle++;
      
      console.log(`💤 Connection marked idle: ${id}`);
      this.emit('connectionIdle', connection);
    }
  }

  destroyConnection(id, reason = 'manual') {
    const connection = this.connections.get(id);
    if (connection) {
      this.connections.delete(id);
      
      if (connection.isActive) {
        this.connectionStats.active--;
      } else {
        this.connectionStats.idle--;
      }
      
      this.connectionStats.total--;
      this.connectionStats.destroyed++;
      
      console.log(`🗑️ Connection destroyed: ${id} (reason: ${reason})`);
      this.emit('connectionDestroyed', { connection, reason });
      
      return true;
    }
    return false;
  }

  startCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
    
    console.log('🧹 Connection pool cleanup timer started');
  }

  cleanup() {
    const now = Date.now();
    const toDestroy = [];
    
    // Find idle connections that have exceeded max idle time
    for (const [id, connection] of this.connections) {
      if (!connection.isActive && (now - connection.lastActivity) > this.maxIdleTime) {
        toDestroy.push(id);
      }
    }
    
    // Destroy idle connections
    let cleanedUp = 0;
    for (const id of toDestroy) {
      if (this.destroyConnection(id, 'idle_timeout')) {
        cleanedUp++;
      }
    }
    
    if (cleanedUp > 0) {
      console.log(`🧹 Cleaned up ${cleanedUp} idle connections`);
    }
    
    this.emit('cleanup', { cleanedUp, remaining: this.connections.size });
  }

  getPoolStats() {
    const now = Date.now();
    const connectionAges = Array.from(this.connections.values()).map(conn => now - conn.createdAt);
    const averageAge = connectionAges.length > 0 ? 
      connectionAges.reduce((sum, age) => sum + age, 0) / connectionAges.length : 0;

    return {
      connections: {
        total: this.connectionStats.total,
        active: this.connectionStats.active,
        idle: this.connectionStats.idle,
        peak: this.connectionStats.peak
      },
      capacity: {
        max: this.maxConnections,
        used: this.connections.size,
        available: this.maxConnections - this.connections.size,
        utilization: `${((this.connections.size / this.maxConnections) * 100).toFixed(1)}%`
      },
      lifecycle: {
        created: this.connectionStats.created,
        destroyed: this.connectionStats.destroyed,
        rejected: this.connectionStats.rejected
      },
      timing: {
        averageAge: `${(averageAge / 1000).toFixed(1)}s`,
        maxIdleTime: `${(this.maxIdleTime / 1000).toFixed(1)}s`,
        cleanupInterval: `${(this.cleanupInterval / 1000).toFixed(1)}s`
      }
    };
  }

  getConnectionDetails() {
    const details = [];
    const now = Date.now();
    
    for (const [id, connection] of this.connections) {
      details.push({
        id,
        age: `${((now - connection.createdAt) / 1000).toFixed(1)}s`,
        idleTime: `${((now - connection.lastActivity) / 1000).toFixed(1)}s`,
        isActive: connection.isActive,
        requests: connection.metadata.requests,
        errors: connection.metadata.errors,
        dataTransferred: `${(connection.metadata.dataTransferred / 1024).toFixed(2)}KB`
      });
    }
    
    return details.sort((a, b) => b.requests - a.requests);
  }

  // Graceful shutdown
  shutdown() {
    console.log('🔌 Shutting down connection pool...');
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    // Destroy all connections
    const connectionIds = Array.from(this.connections.keys());
    let destroyed = 0;
    
    for (const id of connectionIds) {
      if (this.destroyConnection(id, 'shutdown')) {
        destroyed++;
      }
    }
    
    console.log(`🔌 Connection pool shutdown complete. Destroyed ${destroyed} connections.`);
    this.emit('shutdown', { destroyed });
  }

  // Force cleanup of problematic connections
  forceCleanup(criteria = {}) {
    const now = Date.now();
    const toDestroy = [];
    
    for (const [id, connection] of this.connections) {
      let shouldDestroy = false;
      
      // Criteria-based cleanup
      if (criteria.maxAge && (now - connection.createdAt) > criteria.maxAge) {
        shouldDestroy = true;
      }
      
      if (criteria.maxErrors && connection.metadata.errors > criteria.maxErrors) {
        shouldDestroy = true;
      }
      
      if (criteria.minActivity && connection.metadata.requests < criteria.minActivity) {
        shouldDestroy = true;
      }
      
      if (shouldDestroy) {
        toDestroy.push(id);
      }
    }
    
    let forceCleaned = 0;
    for (const id of toDestroy) {
      if (this.destroyConnection(id, 'force_cleanup')) {
        forceCleaned++;
      }
    }
    
    console.log(`🧹 Force cleanup completed: ${forceCleaned} connections destroyed`);
    return forceCleaned;
  }
}

// WebSocket connection pool specifically for chat connections
class WebSocketConnectionPool extends ConnectionPool {
  constructor(options = {}) {
    super({
      maxConnections: options.maxConnections || 50,
      maxIdleTime: options.maxIdleTime || 60000, // 1 minute for WebSocket
      cleanupInterval: options.cleanupInterval || 30000, // 30 seconds
      ...options
    });
    
    this.roomConnections = new Map(); // Track connections by room
  }

  createWebSocketConnection(id, ws, room = 'general', userData = {}) {
    const connection = this.createConnection(id, {
      ws,
      room,
      userData,
      type: 'websocket'
    });
    
    // Track room connections
    if (!this.roomConnections.has(room)) {
      this.roomConnections.set(room, new Set());
    }
    this.roomConnections.get(room).add(id);
    
    return connection;
  }

  destroyConnection(id, reason = 'manual') {
    const connection = this.connections.get(id);
    if (connection && connection.data.room) {
      const roomSet = this.roomConnections.get(connection.data.room);
      if (roomSet) {
        roomSet.delete(id);
        if (roomSet.size === 0) {
          this.roomConnections.delete(connection.data.room);
        }
      }
    }
    
    return super.destroyConnection(id, reason);
  }

  getRoomStats() {
    const roomStats = {};
    for (const [room, connectionIds] of this.roomConnections) {
      roomStats[room] = {
        connections: connectionIds.size,
        activeConnections: 0
      };
      
      // Count active connections in room
      for (const id of connectionIds) {
        const connection = this.connections.get(id);
        if (connection && connection.isActive) {
          roomStats[room].activeConnections++;
        }
      }
    }
    
    return roomStats;
  }
}

// Global connection pools
const httpConnectionPool = new ConnectionPool({
  maxConnections: 200,
  maxIdleTime: 60000, // 1 minute
  cleanupInterval: 120000 // 2 minutes
});

const wsConnectionPool = new WebSocketConnectionPool({
  maxConnections: 100,
  maxIdleTime: 300000, // 5 minutes
  cleanupInterval: 60000 // 1 minute
});

export { ConnectionPool, WebSocketConnectionPool, httpConnectionPool, wsConnectionPool };
