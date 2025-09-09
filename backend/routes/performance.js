// Performance monitoring endpoints
import express from 'express';
import memoryMonitor from '../utils/memoryMonitor.js';
import { httpConnectionPool, wsConnectionPool } from '../utils/connectionPool.js';

const router = express.Router();

// Memory monitoring endpoint
router.get('/memory', (req, res) => {
  try {
    const stats = memoryMonitor.getMemoryStats();
    const trend = memoryMonitor.getMemoryTrend();
    
    res.json({
      status: 'success',
      data: {
        stats,
        trend,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get memory stats',
      error: error.message
    });
  }
});

// Memory history endpoint
router.get('/memory/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = memoryMonitor.history.slice(-limit);
    
    res.json({
      status: 'success',
      data: {
        history: history.map(entry => ({
          timestamp: entry.timestamp,
          heapUsed: entry.heapUsed,
          heapTotal: entry.heapTotal,
          rss: entry.rss,
          heapUtilization: (entry.heapUsed / entry.heapTotal * 100).toFixed(2)
        })),
        count: history.length,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get memory history',
      error: error.message
    });
  }
});

// Connection pool stats
router.get('/connections', (req, res) => {
  try {
    const httpStats = httpConnectionPool.getPoolStats();
    const wsStats = wsConnectionPool.getPoolStats();
    const roomStats = wsConnectionPool.getRoomStats();
    
    res.json({
      status: 'success',
      data: {
        http: httpStats,
        websocket: wsStats,
        rooms: roomStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get connection stats',
      error: error.message
    });
  }
});

// Connection details
router.get('/connections/details', (req, res) => {
  try {
    const httpDetails = httpConnectionPool.getConnectionDetails();
    const wsDetails = wsConnectionPool.getConnectionDetails();
    
    res.json({
      status: 'success',
      data: {
        http: httpDetails,
        websocket: wsDetails,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get connection details',
      error: error.message
    });
  }
});

// Trigger memory cleanup
router.post('/memory/cleanup', (req, res) => {
  try {
    memoryMonitor.cleanup();
    const stats = memoryMonitor.getMemoryStats();
    
    res.json({
      status: 'success',
      message: 'Memory cleanup triggered',
      data: {
        stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to trigger memory cleanup',
      error: error.message
    });
  }
});

// Trigger connection pool cleanup
router.post('/connections/cleanup', (req, res) => {
  try {
    httpConnectionPool.cleanup();
    wsConnectionPool.cleanup();
    
    const httpStats = httpConnectionPool.getPoolStats();
    const wsStats = wsConnectionPool.getPoolStats();
    
    res.json({
      status: 'success',
      message: 'Connection pool cleanup triggered',
      data: {
        http: httpStats,
        websocket: wsStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to trigger connection cleanup',
      error: error.message
    });
  }
});

// Force cleanup with criteria
router.post('/connections/force-cleanup', (req, res) => {
  try {
    const criteria = req.body || {};
    
    const httpCleaned = httpConnectionPool.forceCleanup(criteria);
    const wsCleaned = wsConnectionPool.forceCleanup(criteria);
    
    res.json({
      status: 'success',
      message: 'Force cleanup completed',
      data: {
        cleaned: {
          http: httpCleaned,
          websocket: wsCleaned,
          total: httpCleaned + wsCleaned
        },
        criteria,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to force cleanup connections',
      error: error.message
    });
  }
});

// Performance dashboard data
router.get('/dashboard', (req, res) => {
  try {
    const memoryStats = memoryMonitor.getMemoryStats();
    const memoryTrend = memoryMonitor.getMemoryTrend();
    const httpStats = httpConnectionPool.getPoolStats();
    const wsStats = wsConnectionPool.getPoolStats();
    const roomStats = wsConnectionPool.getRoomStats();
    
    // System info
    const systemInfo = {
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Performance summary
    const performance = {
      memory: {
        current: memoryStats.current,
        trend: memoryTrend,
        alerts: {
          warnings: memoryStats.stats.warnings,
          criticals: memoryStats.stats.criticals
        }
      },
      connections: {
        http: {
          total: httpStats.connections.total,
          active: httpStats.connections.active,
          utilization: httpStats.capacity.utilization
        },
        websocket: {
          total: wsStats.connections.total,
          active: wsStats.connections.active,
          utilization: wsStats.capacity.utilization,
          rooms: Object.keys(roomStats).length
        }
      }
    };
    
    res.json({
      status: 'success',
      data: {
        system: systemInfo,
        performance,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

export default router;
