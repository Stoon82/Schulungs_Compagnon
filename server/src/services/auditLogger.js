import db from './database.js';

class AuditLogger {
  async log(action, data = {}, metadata = {}) {
    const {
      participantId = null,
      adminId = null,
      ipAddress = null,
      userAgent = null,
      success = true,
      errorMessage = null
    } = metadata;

    try {
      await db.run(
        `INSERT INTO audit_logs (
          action, 
          participant_id, 
          admin_id, 
          data, 
          ip_address, 
          user_agent, 
          success, 
          error_message, 
          timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          action,
          participantId,
          adminId,
          JSON.stringify(data),
          ipAddress,
          userAgent,
          success ? 1 : 0,
          errorMessage
        ]
      );
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  async logAuth(action, participantId, metadata) {
    await this.log(`auth:${action}`, { participantId }, metadata);
  }

  async logAdmin(action, adminId, data, metadata) {
    await this.log(`admin:${action}`, data, { ...metadata, adminId });
  }

  async logModule(action, participantId, moduleId, metadata) {
    await this.log(`module:${action}`, { participantId, moduleId }, metadata);
  }

  async logMood(participantId, mood, moduleId, metadata) {
    await this.log('mood:update', { participantId, mood, moduleId }, metadata);
  }

  async logSandbox(action, participantId, appId, metadata) {
    await this.log(`sandbox:${action}`, { participantId, appId }, metadata);
  }

  async logChat(participantId, messageLength, metadata) {
    await this.log('chat:message', { participantId, messageLength }, metadata);
  }

  async getLogs(filters = {}) {
    const {
      action = null,
      participantId = null,
      adminId = null,
      startDate = null,
      endDate = null,
      success = null,
      limit = 100
    } = filters;

    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (action) {
      sql += ' AND action LIKE ?';
      params.push(`%${action}%`);
    }

    if (participantId) {
      sql += ' AND participant_id = ?';
      params.push(participantId);
    }

    if (adminId) {
      sql += ' AND admin_id = ?';
      params.push(adminId);
    }

    if (startDate) {
      sql += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND timestamp <= ?';
      params.push(endDate);
    }

    if (success !== null) {
      sql += ' AND success = ?';
      params.push(success ? 1 : 0);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    return await db.all(sql, params);
  }

  async getStatistics(timeRange = '24 hours') {
    const timeMap = {
      '1 hour': '-1 hour',
      '24 hours': '-24 hours',
      '7 days': '-7 days',
      '30 days': '-30 days'
    };

    const sql = `
      SELECT 
        action,
        COUNT(*) as count,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failure_count
      FROM audit_logs
      WHERE timestamp > datetime('now', ?)
      GROUP BY action
      ORDER BY count DESC
    `;

    return await db.all(sql, [timeMap[timeRange] || '-24 hours']);
  }

  async cleanup(daysToKeep = 90) {
    const sql = `
      DELETE FROM audit_logs 
      WHERE timestamp < datetime('now', '-' || ? || ' days')
    `;

    const result = await db.run(sql, [daysToKeep]);
    return result.changes;
  }
}

export default new AuditLogger();
