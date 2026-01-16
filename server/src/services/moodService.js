import db from './database.js';
import eventBus from '../eventBus.js';

class MoodService {
  constructor() {
    this.validMoods = ['confused', 'thinking', 'aha', 'wow'];
  }

  isValidMood(mood) {
    return this.validMoods.includes(mood);
  }

  async recordMood(participantId, mood, moduleId = null) {
    if (!this.isValidMood(mood)) {
      throw new Error('Invalid mood type');
    }

    const sql = `
      INSERT INTO moods (participant_id, mood, module_id, timestamp)
      VALUES (?, ?, ?, datetime('now'))
    `;

    const result = await db.run(sql, [participantId, mood, moduleId]);

    eventBus.emitMoodUpdate(participantId, mood, moduleId);

    return {
      id: result.id,
      participantId,
      mood,
      moduleId,
      timestamp: new Date().toISOString()
    };
  }

  async getParticipantMoods(participantId, limit = 50) {
    const sql = `
      SELECT id, mood, module_id, timestamp
      FROM moods
      WHERE participant_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    return await db.all(sql, [participantId, limit]);
  }

  async getAllMoods(limit = 100) {
    const sql = `
      SELECT m.id, m.participant_id, p.nickname, m.mood, m.module_id, m.timestamp
      FROM moods m
      LEFT JOIN participants p ON m.participant_id = p.id
      ORDER BY m.timestamp DESC
      LIMIT ?
    `;

    return await db.all(sql, [limit]);
  }

  async getMoodStatistics(moduleId = null) {
    let sql = `
      SELECT 
        mood,
        COUNT(*) as count,
        COUNT(DISTINCT participant_id) as unique_participants
      FROM moods
    `;

    const params = [];

    if (moduleId) {
      sql += ' WHERE module_id = ?';
      params.push(moduleId);
    }

    sql += ' GROUP BY mood';

    return await db.all(sql, params);
  }

  async getMoodTimeline(minutes = 60) {
    const sql = `
      SELECT 
        strftime('%Y-%m-%d %H:%M', timestamp) as time_bucket,
        mood,
        COUNT(*) as count
      FROM moods
      WHERE timestamp >= datetime('now', '-' || ? || ' minutes')
      GROUP BY time_bucket, mood
      ORDER BY time_bucket ASC
    `;

    return await db.all(sql, [minutes]);
  }

  async getEngagementHeatmap() {
    const sql = `
      SELECT 
        module_id,
        mood,
        COUNT(*) as count,
        COUNT(DISTINCT participant_id) as participants
      FROM moods
      WHERE module_id IS NOT NULL
      GROUP BY module_id, mood
      ORDER BY module_id, mood
    `;

    return await db.all(sql);
  }
}

export default new MoodService();
