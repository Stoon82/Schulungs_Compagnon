class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  createLimiter(options = {}) {
    const {
      windowMs = 60000, // 1 minute
      maxRequests = 100,
      message = 'Too many requests, please try again later.',
      skipSuccessfulRequests = false,
      keyGenerator = (req) => req.ip || req.connection.remoteAddress
    } = options;

    return (req, res, next) => {
      const key = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }

      const userRequests = this.requests.get(key);
      const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);

      if (recentRequests.length >= maxRequests) {
        const oldestRequest = Math.min(...recentRequests);
        const retryAfter = Math.ceil((windowMs - (now - oldestRequest)) / 1000);

        res.setHeader('Retry-After', retryAfter);
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(oldestRequest + windowMs).toISOString());

        return res.status(429).json({
          success: false,
          error: message,
          retryAfter
        });
      }

      recentRequests.push(now);
      this.requests.set(key, recentRequests);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - recentRequests.length);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      if (skipSuccessfulRequests) {
        const originalSend = res.send;
        res.send = function(data) {
          if (res.statusCode >= 400) {
            // Keep the request count for failed requests
          } else {
            // Remove the last request for successful ones
            const requests = this.requests.get(key);
            if (requests && requests.length > 0) {
              requests.pop();
            }
          }
          return originalSend.call(this, data);
        }.bind(this);
      }

      next();
    };
  }

  cleanup() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, timestamps] of this.requests.entries()) {
      const recentTimestamps = timestamps.filter(t => now - t < maxAge);
      
      if (recentTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentTimestamps);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

const rateLimiter = new RateLimiter();

export const apiLimiter = rateLimiter.createLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  message: 'Too many API requests, please slow down.'
});

export const authLimiter = rateLimiter.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true
});

export const chatLimiter = rateLimiter.createLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 10,
  message: 'Too many chat messages, please slow down.'
});

export const sandboxLimiter = rateLimiter.createLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 5,
  message: 'Too many sandbox submissions, please slow down.'
});

export default rateLimiter;
