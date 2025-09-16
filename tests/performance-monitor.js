#!/usr/bin/env node

// Performance monitoring for AkAsH Share
const http = require('http');
const WebSocket = require('ws');

console.log('📊 AkAsH Share Performance Monitor');
console.log('=================================');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      memoryUsage: [],
      responseTime: [],
      wsConnections: 0,
      apiCalls: 0,
      errors: 0
    };
    this.isRunning = false;
  }

  async measureResponseTime(path = '/health') {
    const start = Date.now();
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5004,
        path: path,
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        
        res.on('end', () => {
          const responseTime = Date.now() - start;
          this.metrics.responseTime.push(responseTime);
          this.metrics.apiCalls++;
          
          try {
            const json = JSON.parse(data);
            if (json.system && json.system.memory) {
              this.metrics.memoryUsage.push({
                timestamp: Date.now(),
                ...json.system.memory
              });
            }
          } catch (err) {
            // Ignore JSON parse errors for non-JSON endpoints
          }
          
          resolve(responseTime);
        });
      });

      req.on('error', (err) => {
        this.metrics.errors++;
        resolve(-1);
      });

      req.on('timeout', () => {
        this.metrics.errors++;
        req.destroy();
        resolve(-1);
      });

      req.end();
    });
  }

  async testWebSocketPerformance() {
    return new Promise((resolve) => {
      const connections = [];
      const messagesSent = [];
      const messagesReceived = [];
      const connectTimes = [];

      // Test multiple concurrent connections
      for (let i = 0; i < 5; i++) {
        const connectStart = Date.now();
        const ws = new WebSocket(`ws://localhost:5004/chat?username=PerfTest${i}&room=performance`);
        
        ws.on('open', () => {
          connectTimes.push(Date.now() - connectStart);
          this.metrics.wsConnections++;
          
          // Send test messages
          for (let j = 0; j < 3; j++) {
            const messageStart = Date.now();
            ws.send(JSON.stringify({
              type: 'message',
              message: `Performance test message ${j}`,
              room: 'performance'
            }));
            messagesSent.push(messageStart);
          }
        });

        ws.on('message', (data) => {
          messagesReceived.push(Date.now());
        });

        ws.on('error', () => {
          this.metrics.errors++;
        });

        connections.push(ws);
      }

      // Cleanup after test
      setTimeout(() => {
        connections.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        });

        const avgConnectTime = connectTimes.reduce((a, b) => a + b, 0) / connectTimes.length;
        console.log(`📈 WebSocket Performance:`);
        console.log(`   Average connection time: ${avgConnectTime.toFixed(2)}ms`);
        console.log(`   Messages sent: ${messagesSent.length}`);
        console.log(`   Messages received: ${messagesReceived.length}`);
        console.log(`   Success rate: ${((messagesReceived.length / messagesSent.length) * 100).toFixed(1)}%`);
        
        resolve({
          avgConnectTime,
          messagesSent: messagesSent.length,
          messagesReceived: messagesReceived.length
        });
      }, 3000);
    });
  }

  printMetrics() {
    console.log(`\n📊 Performance Metrics Summary:`);
    console.log(`   API Calls: ${this.metrics.apiCalls}`);
    console.log(`   Errors: ${this.metrics.errors}`);
    console.log(`   WebSocket Connections: ${this.metrics.wsConnections}`);
    
    if (this.metrics.responseTime.length > 0) {
      const avgResponse = this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length;
      const maxResponse = Math.max(...this.metrics.responseTime);
      const minResponse = Math.min(...this.metrics.responseTime);
      
      console.log(`   Response Time - Avg: ${avgResponse.toFixed(2)}ms, Min: ${minResponse}ms, Max: ${maxResponse}ms`);
    }
    
    if (this.metrics.memoryUsage.length > 0) {
      const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      console.log(`   Memory Usage - RSS: ${(latestMemory.rss / 1024 / 1024).toFixed(2)}MB, Heap: ${(latestMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  async runContinuousMonitoring(duration = 30000) {
    console.log(`🔄 Starting continuous monitoring for ${duration / 1000} seconds...`);
    this.isRunning = true;
    
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      
      const responseTime = await this.measureResponseTime();
      if (responseTime > 0) {
        process.stdout.write('.');
      } else {
        process.stdout.write('X');
      }
    }, 1000);

    setTimeout(() => {
      this.isRunning = false;
      clearInterval(interval);
      console.log('\n✅ Monitoring complete');
      this.printMetrics();
    }, duration);
  }

  async runPerformanceTest() {
    console.log('🚀 Starting performance tests...\n');
    
    // Test initial response time
    console.log('📡 Testing API response time...');
    for (let i = 0; i < 10; i++) {
      await this.measureResponseTime();
      process.stdout.write('.');
    }
    console.log(' Done');
    
    // Test WebSocket performance
    console.log('\n🔌 Testing WebSocket performance...');
    await this.testWebSocketPerformance();
    
    // Run continuous monitoring
    await this.runContinuousMonitoring(15000);
    
    // Final health check
    console.log('\n🏥 Final health check...');
    const finalResponse = await this.measureResponseTime();
    if (finalResponse > 0) {
      console.log(`✅ Backend still responsive: ${finalResponse}ms`);
    } else {
      console.log('❌ Backend not responding');
    }
    
    console.log('\n=================================');
    console.log('📊 Performance test complete!');
  }
}

// Run performance monitoring
const monitor = new PerformanceMonitor();
monitor.runPerformanceTest().catch(err => {
  console.error('❌ Performance test failed:', err);
  process.exit(1);
});

