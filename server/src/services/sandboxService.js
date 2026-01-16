import db from './database.js';
import crypto from 'crypto';
import eventBus from '../eventBus.js';
import sanitizeHtml from 'sanitize-html';

class SandboxService {
  constructor() {
    this.maxCodeSize = parseInt(process.env.MAX_CODE_SIZE_KB || '50') * 1024;
    
    this.sanitizeOptions = {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['style']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class', 'id', 'style']
      },
      allowedSchemes: ['http', 'https', 'data'],
      disallowedTagsMode: 'escape'
    };
  }

  generateAppId() {
    return `app_${crypto.randomBytes(8).toString('hex')}`;
  }

  sanitizeCode(code) {
    return sanitizeHtml(code, this.sanitizeOptions);
  }

  validateCode(code) {
    if (!code || typeof code !== 'string') {
      throw new Error('Code is required and must be a string');
    }

    if (code.length > this.maxCodeSize) {
      throw new Error(`Code exceeds maximum size of ${this.maxCodeSize / 1024}KB`);
    }

    const dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error('Code contains potentially dangerous patterns');
      }
    }

    return true;
  }

  async createApp(participantId, title, code) {
    this.validateCode(code);

    const appId = this.generateAppId();
    const sanitizedCode = this.sanitizeCode(code);

    const sql = `
      INSERT INTO sandbox_apps (id, participant_id, title, code, created_at, is_active)
      VALUES (?, ?, ?, ?, datetime('now'), 1)
    `;

    await db.run(sql, [appId, participantId, title, sanitizedCode]);

    eventBus.emitAppCreated(appId, participantId, { title });

    return {
      appId,
      title,
      code: sanitizedCode,
      createdAt: new Date().toISOString()
    };
  }

  async getApp(appId) {
    const sql = `
      SELECT a.*, p.nickname
      FROM sandbox_apps a
      LEFT JOIN participants p ON a.participant_id = p.id
      WHERE a.id = ? AND a.is_active = 1
    `;

    return await db.get(sql, [appId]);
  }

  async getAllApps(limit = 50) {
    const sql = `
      SELECT 
        a.id,
        a.participant_id,
        p.nickname,
        a.title,
        a.created_at,
        a.is_featured,
        (SELECT COUNT(*) FROM votes WHERE app_id = a.id AND vote_type = 'up') as upvotes,
        (SELECT COUNT(*) FROM votes WHERE app_id = a.id AND vote_type = 'down') as downvotes
      FROM sandbox_apps a
      LEFT JOIN participants p ON a.participant_id = p.id
      WHERE a.is_active = 1
      ORDER BY a.created_at DESC
      LIMIT ?
    `;

    return await db.all(sql, [limit]);
  }

  async voteApp(appId, participantId, voteType) {
    if (!['up', 'down'].includes(voteType)) {
      throw new Error('Invalid vote type');
    }

    const existingVote = await db.get(
      'SELECT * FROM votes WHERE app_id = ? AND participant_id = ?',
      [appId, participantId]
    );

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        await db.run(
          'DELETE FROM votes WHERE app_id = ? AND participant_id = ?',
          [appId, participantId]
        );
        
        eventBus.emitAppVoted(appId, participantId, 'removed');
        
        return { action: 'removed', voteType };
      } else {
        await db.run(
          'UPDATE votes SET vote_type = ?, timestamp = datetime("now") WHERE app_id = ? AND participant_id = ?',
          [voteType, appId, participantId]
        );
        
        eventBus.emitAppVoted(appId, participantId, voteType);
        
        return { action: 'changed', voteType };
      }
    } else {
      await db.run(
        'INSERT INTO votes (app_id, participant_id, vote_type, timestamp) VALUES (?, ?, ?, datetime("now"))',
        [appId, participantId, voteType]
      );
      
      eventBus.emitAppVoted(appId, participantId, voteType);
      
      return { action: 'added', voteType };
    }
  }

  async getAppVotes(appId) {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM votes WHERE app_id = ? AND vote_type = 'up') as upvotes,
        (SELECT COUNT(*) FROM votes WHERE app_id = ? AND vote_type = 'down') as downvotes
    `;

    return await db.get(sql, [appId, appId]);
  }

  async toggleFeatured(appId, isFeatured) {
    const sql = 'UPDATE sandbox_apps SET is_featured = ? WHERE id = ?';
    await db.run(sql, [isFeatured ? 1 : 0, appId]);
    
    return { appId, isFeatured };
  }

  async deactivateApp(appId) {
    const sql = 'UPDATE sandbox_apps SET is_active = 0 WHERE id = ?';
    await db.run(sql, [appId]);
    
    return { appId, deactivated: true };
  }
}

export default new SandboxService();
