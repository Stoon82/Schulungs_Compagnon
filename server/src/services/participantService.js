import db from './database.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

class ParticipantService {
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateParticipantId() {
    return `p_${uuidv4().split('-')[0]}`;
  }

  generateAvatarSeed(nickname) {
    const hash = crypto.createHash('md5').update(nickname || 'anonymous').digest('hex');
    return hash.substring(0, 8);
  }

  async createParticipant(nickname = null) {
    const participantId = this.generateParticipantId();
    const sessionToken = this.generateSessionToken();
    const avatarSeed = this.generateAvatarSeed(nickname || participantId);

    const sql = `
      INSERT INTO participants (id, nickname, session_token, avatar_seed, created_at, last_seen)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    await db.run(sql, [participantId, nickname, sessionToken, avatarSeed]);

    await this.unlockInitialModules(participantId);

    return {
      participantId,
      sessionToken,
      nickname,
      avatarSeed
    };
  }

  async unlockInitialModules(participantId) {
    const initialModules = ['prolog', 'module_1'];
    
    for (const moduleId of initialModules) {
      await db.run(
        'INSERT INTO progress (participant_id, module_id, unlocked_at) VALUES (?, ?, datetime("now"))',
        [participantId, moduleId]
      );
    }
  }

  async getParticipantByToken(sessionToken) {
    const sql = 'SELECT * FROM participants WHERE session_token = ?';
    return await db.get(sql, [sessionToken]);
  }

  async getParticipantById(participantId) {
    const sql = 'SELECT * FROM participants WHERE id = ?';
    return await db.get(sql, [participantId]);
  }

  async updateLastSeen(participantId) {
    const sql = 'UPDATE participants SET last_seen = datetime("now") WHERE id = ?';
    await db.run(sql, [participantId]);
  }

  async getParticipantProgress(participantId) {
    const sql = `
      SELECT module_id, unlocked_at, completed, completed_at
      FROM progress
      WHERE participant_id = ?
      ORDER BY unlocked_at ASC
    `;
    return await db.all(sql, [participantId]);
  }

  async getAllParticipants() {
    const sql = 'SELECT id, nickname, avatar_seed, created_at, last_seen FROM participants ORDER BY created_at DESC';
    return await db.all(sql);
  }
}

export default new ParticipantService();
