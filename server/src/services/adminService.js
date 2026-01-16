import db from './database.js';
import eventBus from '../eventBus.js';
import crypto from 'crypto';

class AdminService {
  async getDashboardStats() {
    const participants = await db.all('SELECT COUNT(*) as count FROM participants');
    const activeSessions = await db.all(
      `SELECT COUNT(*) as count FROM participants 
       WHERE last_seen > datetime('now', '-5 minutes')`
    );
    const totalMoods = await db.all('SELECT COUNT(*) as count FROM moods');
    const totalApps = await db.all('SELECT COUNT(*) as count FROM sandbox_apps WHERE is_active = 1');
    const chatMessages = await db.all('SELECT COUNT(*) as count FROM chat_history');

    return {
      totalParticipants: participants[0].count,
      activeSessions: activeSessions[0].count,
      totalMoodUpdates: totalMoods[0].count,
      totalApps: totalApps[0].count,
      totalChatMessages: chatMessages[0].count
    };
  }

  async getParticipantsList() {
    const sql = `
      SELECT 
        id,
        nickname,
        avatar_seed,
        created_at,
        last_seen,
        CASE 
          WHEN last_seen > datetime('now', '-5 minutes') THEN 1
          ELSE 0
        END as is_online
      FROM participants
      ORDER BY last_seen DESC
    `;

    return await db.all(sql);
  }

  async getParticipantDetails(participantId) {
    const participant = await db.get(
      'SELECT * FROM participants WHERE id = ?',
      [participantId]
    );

    if (!participant) {
      throw new Error('Participant not found');
    }

    const progress = await db.all(
      'SELECT * FROM progress WHERE participant_id = ? ORDER BY unlocked_at DESC',
      [participantId]
    );

    const moods = await db.all(
      'SELECT * FROM moods WHERE participant_id = ? ORDER BY timestamp DESC LIMIT 20',
      [participantId]
    );

    const apps = await db.all(
      'SELECT * FROM sandbox_apps WHERE participant_id = ? AND is_active = 1 ORDER BY created_at DESC',
      [participantId]
    );

    return {
      participant,
      progress,
      moods,
      apps
    };
  }

  async getMoodAnalytics(timeRange = '1 hour') {
    const timeMap = {
      '1 hour': '-1 hour',
      '6 hours': '-6 hours',
      '24 hours': '-24 hours',
      '7 days': '-7 days'
    };

    const sql = `
      SELECT 
        strftime('%Y-%m-%d %H:%M', timestamp) as time,
        mood,
        COUNT(*) as count
      FROM moods
      WHERE timestamp > datetime('now', ?)
      GROUP BY time, mood
      ORDER BY time ASC
    `;

    return await db.all(sql, [timeMap[timeRange] || '-1 hour']);
  }

  async getEngagementHeatmap() {
    const sql = `
      SELECT 
        p.module_id,
        m.mood,
        COUNT(*) as count
      FROM progress p
      LEFT JOIN moods m ON p.participant_id = m.participant_id AND p.module_id = m.module_id
      WHERE m.mood IS NOT NULL
      GROUP BY p.module_id, m.mood
      ORDER BY p.module_id, m.mood
    `;

    return await db.all(sql);
  }

  async unlockModuleForParticipant(participantId, moduleId) {
    const existing = await db.get(
      'SELECT * FROM progress WHERE participant_id = ? AND module_id = ?',
      [participantId, moduleId]
    );

    if (existing) {
      throw new Error('Module already unlocked');
    }

    await db.run(
      `INSERT INTO progress (participant_id, module_id, unlocked, unlocked_at)
       VALUES (?, ?, 1, datetime('now'))`,
      [participantId, moduleId]
    );

    eventBus.emitModuleUnlock(participantId, moduleId);

    await this.logAdminAction('module_unlock', { participantId, moduleId });

    return { success: true };
  }

  async unlockModuleForAll(moduleId) {
    const participants = await db.all('SELECT id FROM participants');
    
    let unlocked = 0;
    for (const participant of participants) {
      try {
        await this.unlockModuleForParticipant(participant.id, moduleId);
        unlocked++;
      } catch (error) {
        // Skip if already unlocked
      }
    }

    return { unlocked, total: participants.length };
  }

  async broadcastMessage(message, type = 'info') {
    eventBus.emit('admin:broadcast', {
      message,
      type,
      timestamp: Date.now()
    });

    await this.logAdminAction('broadcast', { message, type });

    return { success: true };
  }

  async kickParticipant(participantId) {
    await db.run(
      'UPDATE participants SET session_token = NULL WHERE id = ?',
      [participantId]
    );

    eventBus.emit('admin:kick', { participantId });

    await this.logAdminAction('kick_participant', { participantId });

    return { success: true };
  }

  async pauseSystem() {
    eventBus.emit('admin:system_pause', { paused: true });
    await this.logAdminAction('system_pause', {});
    return { success: true };
  }

  async resumeSystem() {
    eventBus.emit('admin:system_resume', { paused: false });
    await this.logAdminAction('system_resume', {});
    return { success: true };
  }

  async generateSecretCode(moduleId, description) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    await db.run(
      `INSERT INTO secret_codes (code, module_id, description, created_at, is_active)
       VALUES (?, ?, ?, datetime('now'), 1)`,
      [code, moduleId, description]
    );

    await this.logAdminAction('generate_code', { code, moduleId, description });

    return { code, moduleId, description };
  }

  async getSecretCodes() {
    return await db.all(
      `SELECT * FROM secret_codes ORDER BY created_at DESC`
    );
  }

  async deactivateSecretCode(code) {
    await db.run(
      'UPDATE secret_codes SET is_active = 0 WHERE code = ?',
      [code]
    );

    await this.logAdminAction('deactivate_code', { code });

    return { success: true };
  }

  async toggleAppFeatured(appId, isFeatured) {
    await db.run(
      'UPDATE sandbox_apps SET is_featured = ? WHERE id = ?',
      [isFeatured ? 1 : 0, appId]
    );

    await this.logAdminAction('toggle_app_featured', { appId, isFeatured });

    return { success: true };
  }

  async deactivateApp(appId) {
    await db.run(
      'UPDATE sandbox_apps SET is_active = 0 WHERE id = ?',
      [appId]
    );

    await this.logAdminAction('deactivate_app', { appId });

    return { success: true };
  }

  async logAdminAction(action, data) {
    await db.run(
      `INSERT INTO admin_actions (action, data, timestamp)
       VALUES (?, ?, datetime('now'))`,
      [action, JSON.stringify(data)]
    );
  }

  async getAdminLogs(limit = 50) {
    return await db.all(
      'SELECT * FROM admin_actions ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
  }

  async exportData(type = 'all') {
    const data = {};

    if (type === 'all' || type === 'participants') {
      data.participants = await db.all('SELECT * FROM participants');
    }

    if (type === 'all' || type === 'progress') {
      data.progress = await db.all('SELECT * FROM progress');
    }

    if (type === 'all' || type === 'moods') {
      data.moods = await db.all('SELECT * FROM moods');
    }

    if (type === 'all' || type === 'apps') {
      data.apps = await db.all('SELECT * FROM sandbox_apps');
    }

    if (type === 'all' || type === 'chat') {
      data.chatHistory = await db.all('SELECT * FROM chat_history');
    }

    return data;
  }
}

export default new AdminService();
