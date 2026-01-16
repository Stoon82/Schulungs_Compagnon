import chalk from 'chalk';

class DebugTools {
  constructor() {
    this.debugMode = process.env.DEBUG === 'true';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
  }

  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.logLevel];
  }

  error(message, data = null) {
    if (this.shouldLog('error')) {
      console.error(chalk.red.bold('❌ ERROR:'), message);
      if (data) console.error(chalk.red(JSON.stringify(data, null, 2)));
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow.bold('⚠️  WARN:'), message);
      if (data) console.warn(chalk.yellow(JSON.stringify(data, null, 2)));
    }
  }

  info(message, data = null) {
    if (this.shouldLog('info')) {
      console.log(chalk.blue.bold('ℹ️  INFO:'), message);
      if (data) console.log(chalk.blue(JSON.stringify(data, null, 2)));
    }
  }

  debug(message, data = null) {
    if (this.debugMode && this.shouldLog('debug')) {
      console.log(chalk.magenta.bold('🔍 DEBUG:'), message);
      if (data) console.log(chalk.magenta(JSON.stringify(data, null, 2)));
    }
  }

  trace(message, data = null) {
    if (this.debugMode && this.shouldLog('trace')) {
      console.log(chalk.gray.bold('🔬 TRACE:'), message);
      if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
      console.trace();
    }
  }

  success(message, data = null) {
    if (this.shouldLog('info')) {
      console.log(chalk.green.bold('✅ SUCCESS:'), message);
      if (data) console.log(chalk.green(JSON.stringify(data, null, 2)));
    }
  }

  performance(label, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (this.debugMode) {
      console.log(chalk.cyan.bold('⏱️  PERFORMANCE:'), `${label} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }

  async performanceAsync(label, fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (this.debugMode) {
      console.log(chalk.cyan.bold('⏱️  PERFORMANCE:'), `${label} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }

  logRequest(req) {
    if (this.debugMode) {
      console.log(chalk.blue.bold('📥 REQUEST:'), {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        headers: req.headers,
        ip: req.ip
      });
    }
  }

  logResponse(res, statusCode, data) {
    if (this.debugMode) {
      const color = statusCode >= 400 ? chalk.red : chalk.green;
      console.log(color.bold('📤 RESPONSE:'), {
        statusCode,
        data: typeof data === 'object' ? JSON.stringify(data, null, 2) : data
      });
    }
  }

  logSocketEvent(event, data) {
    if (this.debugMode) {
      console.log(chalk.purple.bold('🔌 SOCKET:'), event, data);
    }
  }

  logDatabaseQuery(query, params) {
    if (this.debugMode) {
      console.log(chalk.yellow.bold('💾 DATABASE:'), {
        query,
        params
      });
    }
  }

  separator() {
    if (this.debugMode) {
      console.log(chalk.gray('─'.repeat(80)));
    }
  }

  group(label) {
    if (this.debugMode) {
      console.group(chalk.bold(label));
    }
  }

  groupEnd() {
    if (this.debugMode) {
      console.groupEnd();
    }
  }

  table(data) {
    if (this.debugMode) {
      console.table(data);
    }
  }

  memory() {
    if (this.debugMode) {
      const usage = process.memoryUsage();
      console.log(chalk.cyan.bold('💾 MEMORY:'), {
        rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
}

export default new DebugTools();
