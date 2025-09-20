// WebSocket rate limiting and connection management utility
// Prevents abuse and memory leaks in WebSocket connections

const connectionAttempts = new Map();
const connectionLimits = new Map();

// Use environment variables with fallbacks to current hardcoded values
const RATE_LIMIT_WINDOW = parseInt(process.env.WS_RATE_LIMIT_WINDOW) || 60000; // 1 minute
const MAX_ATTEMPTS = parseInt(process.env.WS_RATE_LIMIT_MAX) || 5;
const MAX_CONNECTIONS_PER_IP = parseInt(process.env.WS_CONNECTION_LIMIT) || 100;

/**
 * Check if IP is rate limited for WebSocket connections
 * @param {string} clientIP - Client IP address
 * @returns {boolean} - True if rate limited
 */
export function isRateLimited(clientIP) {
  const attempts = connectionAttempts.get(clientIP) || [];
  const recentAttempts = attempts.filter(time => Date.now() - time < RATE_LIMIT_WINDOW);
  
  // Update the attempts list
  connectionAttempts.set(clientIP, recentAttempts);
  
  return recentAttempts.length >= MAX_ATTEMPTS;
}

/**
 * Record a connection attempt from an IP
 * @param {string} clientIP - Client IP address
 */
export function recordConnectionAttempt(clientIP) {
  const attempts = connectionAttempts.get(clientIP) || [];
  attempts.push(Date.now());
  connectionAttempts.set(clientIP, attempts);
}

/**
 * Check if IP has too many active connections
 * @param {string} clientIP - Client IP address
 * @returns {boolean} - True if connection limit exceeded
 */
export function hasExceededConnectionLimit(clientIP) {
  const connections = connectionLimits.get(clientIP) || 0;
  return connections >= MAX_CONNECTIONS_PER_IP;
}

/**
 * Increment connection count for an IP
 * @param {string} clientIP - Client IP address
 */
export function incrementConnectionCount(clientIP) {
  const current = connectionLimits.get(clientIP) || 0;
  connectionLimits.set(clientIP, current + 1);
}

/**
 * Decrement connection count for an IP
 * @param {string} clientIP - Client IP address
 */
export function decrementConnectionCount(clientIP) {
  const current = connectionLimits.get(clientIP) || 0;
  if (current > 0) {
    connectionLimits.set(clientIP, current - 1);
  }
  
  // Clean up if no connections
  if (current <= 1) {
    connectionLimits.delete(clientIP);
  }
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimitData() {
  const now = Date.now();
  
  // Clean up old connection attempts
  for (const [ip, attempts] of connectionAttempts.entries()) {
    const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (recentAttempts.length === 0) {
      connectionAttempts.delete(ip);
    } else {
      connectionAttempts.set(ip, recentAttempts);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitData, 5 * 60 * 1000);