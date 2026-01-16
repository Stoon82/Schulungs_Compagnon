import debugTools from '../utils/debugTools.js';

class MonitoringMiddleware {
  constructor() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimeSum = 0;
    this.slowRequestThreshold = 1000; // ms
    this.startTime = Date.now();
  }

  requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();
      this.requestCount++;

      debugTools.logRequest(req);

      const originalSend = res.send;
      res.send = function(data) {
        const responseTime = Date.now() - startTime;
        this.responseTimeSum += responseTime;

        if (responseTime > this.slowRequestThreshold) {
          debugTools.warn(`Slow request detected: ${req.method} ${req.path} (${responseTime}ms)`);
        }

        debugTools.logResponse(res, res.statusCode, data);

        return originalSend.call(res, data);
      }.bind(this);

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        if (res.statusCode >= 400) {
          this.errorCount++;
        }

        if (process.env.DEBUG === 'true') {
          console.log(`${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms`);
        }
      });

      next();
    };
  }

  errorHandler() {
    return (err, req, res, next) => {
      this.errorCount++;
      
      debugTools.error('Request error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });

      res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message
      });
    };
  }

  getStats() {
    const uptime = Date.now() - this.startTime;
    const avgResponseTime = this.requestCount > 0 
      ? this.responseTimeSum / this.requestCount 
      : 0;

    return {
      uptime: Math.floor(uptime / 1000), // seconds
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 
        ? (this.errorCount / this.requestCount * 100).toFixed(2) + '%'
        : '0%',
      avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }

  reset() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimeSum = 0;
    this.startTime = Date.now();
  }

  logStats() {
    const stats = this.getStats();
    debugTools.info('Server Statistics', stats);
    return stats;
  }

  scheduleStatsLogging(intervalMinutes = 60) {
    setInterval(() => {
      this.logStats();
    }, intervalMinutes * 60 * 1000);
    
    debugTools.info(`Stats logging scheduled every ${intervalMinutes} minutes`);
  }
}

export default new MonitoringMiddleware();
