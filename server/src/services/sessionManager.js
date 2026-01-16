import db from './database.js';
import auditLogger from './auditLogger.js';

class SessionManager {
  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 60 * 60 * 1000);
  }

  async cleanupExpiredSessions() {
    const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 hours
    const cutoffTime = new Date(Date.now() - inactiveThreshold).toISOString();

    try {
      const expiredSessions = await db.all(
        `SELECT id, nickname FROM participants 
         WHERE last_seen < ? AND session_token IS NOT NULL`,
        [cutoffTime]
      );

      if (expiredSessions.length > 0) {
        await db.run(
          `UPDATE participants 
           SET session_token = NULL 
           WHERE last_seen < ?`,
          [cutoffTime]
        );

        await auditLogger.log('session:cleanup', {
          count: expiredSessions.length,
          participants: expiredSessions.map(p => p.id)
        });

        console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`);
      }

      return expiredSessions.length;
    } catch (error) {
      console.error('Session cleanup error:', error);
      return 0;
    }
  }

  async invalidateSession(participantId) {
    try {
      await db.run(
        'UPDATE participants SET session_token = NULL WHERE id = ?',
        [participantId]
      );

      await auditLogger.log('session:invalidate', { participantId });

      return true;
    } catch (error) {
      console.error('Failed to invalidate session:', error);
      return false;
    }
  }

  async invalidateAllSessions() {
    try {
      const result = await db.run('UPDATE participants SET session_token = NULL');

      await auditLogger.log('session:invalidate_all', {
        count: result.changes
      });

      console.log(`🔒 Invalidated ${result.changes} sessions`);
      return result.changes;
    } catch (error) {
      console.error('Failed to invalidate all sessions:', error);
      return 0;
    }
  }

  async getActiveSessions() {
    const activeThreshold = 5 * 60 * 1000; // 5 minutes
    const cutoffTime = new Date(Date.now() - activeThreshold).toISOString();

    return await db.all(
      `SELECT id, nickname, last_seen, created_at 
       FROM participants 
       WHERE last_seen > ? AND session_token IS NOT NULL
       ORDER BY last_seen DESC`,
      [cutoffTime]
    );
  }

  async getSessionStatistics() {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_participants,
        COUNT(CASE WHEN session_token IS NOT NULL THEN 1 END) as active_sessions,
        COUNT(CASE WHEN last_seen > datetime('now', '-5 minutes') THEN 1 END) as online_now,
        COUNT(CASE WHEN last_seen > datetime('now', '-1 hour') THEN 1 END) as active_last_hour,
        COUNT(CASE WHEN last_seen > datetime('now', '-24 hours') THEN 1 END) as active_last_day
      FROM participants
    `);

    return stats;
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export default new SessionManager();
