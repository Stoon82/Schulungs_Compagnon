import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ErrorMonitoring {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 1000;
    this.errorLogPath = path.join(__dirname, '../../logs/errors.log');
    this.alertThreshold = 10; // errors per minute
    this.errorCounts = new Map();
    
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  logError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      type: error.name || 'Error'
    };

    this.errorLog.push(errorEntry);

    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    this.writeToFile(errorEntry);
    this.checkAlertThreshold();

    console.error('❌ Error logged:', errorEntry);
  }

  writeToFile(errorEntry) {
    try {
      const logLine = JSON.stringify(errorEntry) + '\n';
      fs.appendFileSync(this.errorLogPath, logLine);
    } catch (err) {
      console.error('Failed to write error log:', err);
    }
  }

  checkAlertThreshold() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentErrors = this.errorLog.filter(
      entry => new Date(entry.timestamp).getTime() > oneMinuteAgo
    );

    if (recentErrors.length >= this.alertThreshold) {
      this.triggerAlert(recentErrors);
    }
  }

  triggerAlert(recentErrors) {
    console.error('🚨 ALERT: High error rate detected!');
    console.error(`${recentErrors.length} errors in the last minute`);
    
    // Group by error type
    const errorTypes = {};
    recentErrors.forEach(err => {
      errorTypes[err.type] = (errorTypes[err.type] || 0) + 1;
    });

    console.error('Error breakdown:', errorTypes);
  }

  getRecentErrors(minutes = 60) {
    const cutoff = Date.now() - (minutes * 60000);
    return this.errorLog.filter(
      entry => new Date(entry.timestamp).getTime() > cutoff
    );
  }

  getErrorStats() {
    const total = this.errorLog.length;
    const last24h = this.getRecentErrors(1440).length;
    const lastHour = this.getRecentErrors(60).length;

    const errorTypes = {};
    this.errorLog.forEach(err => {
      errorTypes[err.type] = (errorTypes[err.type] || 0) + 1;
    });

    return {
      total,
      last24h,
      lastHour,
      errorTypes,
      recentErrors: this.errorLog.slice(-10)
    };
  }

  clearOldErrors(days = 7) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    this.errorLog = this.errorLog.filter(
      entry => new Date(entry.timestamp).getTime() > cutoff
    );
  }
}

export default new ErrorMonitoring();
