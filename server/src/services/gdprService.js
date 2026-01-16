import db from './database.js';
import auditLogger from './auditLogger.js';

class GDPRService {
  async exportUserData(participantId) {
    try {
      const participant = await db.get(
        'SELECT * FROM participants WHERE id = ?',
        [participantId]
      );

      if (!participant) {
        throw new Error('Participant not found');
      }

      const progress = await db.all(
        'SELECT * FROM progress WHERE participant_id = ?',
        [participantId]
      );

      const moods = await db.all(
        'SELECT * FROM moods WHERE participant_id = ?',
        [participantId]
      );

      const apps = await db.all(
        'SELECT * FROM sandbox_apps WHERE participant_id = ?',
        [participantId]
      );

      const votes = await db.all(
        'SELECT * FROM votes WHERE participant_id = ?',
        [participantId]
      );

      const chatHistory = await db.all(
        'SELECT * FROM chat_history WHERE participant_id = ?',
        [participantId]
      );

      const codeRedemptions = await db.all(
        'SELECT * FROM code_redemptions WHERE participant_id = ?',
        [participantId]
      );

      await auditLogger.log('gdpr:export', { participantId });

      return {
        exportDate: new Date().toISOString(),
        participant: {
          ...participant,
          session_token: '[REDACTED]' // Don't export sensitive tokens
        },
        progress,
        moods,
        apps,
        votes,
        chatHistory,
        codeRedemptions,
        metadata: {
          totalMoods: moods.length,
          totalApps: apps.length,
          totalVotes: votes.length,
          totalChatMessages: chatHistory.length
        }
      };
    } catch (error) {
      console.error('GDPR export error:', error);
      throw error;
    }
  }

  async deleteUserData(participantId, options = {}) {
    const {
      keepAnonymizedData = false,
      deleteApps = true,
      deleteChatHistory = true
    } = options;

    try {
      await db.run('BEGIN TRANSACTION');

      if (deleteChatHistory) {
        await db.run('DELETE FROM chat_history WHERE participant_id = ?', [participantId]);
      }

      await db.run('DELETE FROM votes WHERE participant_id = ?', [participantId]);
      await db.run('DELETE FROM code_redemptions WHERE participant_id = ?', [participantId]);
      await db.run('DELETE FROM moods WHERE participant_id = ?', [participantId]);
      await db.run('DELETE FROM progress WHERE participant_id = ?', [participantId]);

      if (deleteApps) {
        await db.run('DELETE FROM sandbox_apps WHERE participant_id = ?', [participantId]);
      } else {
        await db.run(
          'UPDATE sandbox_apps SET participant_id = NULL WHERE participant_id = ?',
          [participantId]
        );
      }

      if (keepAnonymizedData) {
        await db.run(
          `UPDATE participants 
           SET nickname = 'Deleted User', 
               session_token = NULL,
               avatar_seed = 'deleted'
           WHERE id = ?`,
          [participantId]
        );
      } else {
        await db.run('DELETE FROM participants WHERE id = ?', [participantId]);
      }

      await db.run('COMMIT');

      await auditLogger.log('gdpr:delete', {
        participantId,
        keepAnonymizedData,
        deleteApps,
        deleteChatHistory
      });

      return {
        success: true,
        deletedAt: new Date().toISOString()
      };
    } catch (error) {
      await db.run('ROLLBACK');
      console.error('GDPR deletion error:', error);
      throw error;
    }
  }

  async anonymizeUserData(participantId) {
    try {
      await db.run(
        `UPDATE participants 
         SET nickname = 'Anonymous User ' || substr(id, 1, 8),
             session_token = NULL,
             avatar_seed = 'anonymous'
         WHERE id = ?`,
        [participantId]
      );

      await db.run(
        'DELETE FROM chat_history WHERE participant_id = ?',
        [participantId]
      );

      await auditLogger.log('gdpr:anonymize', { participantId });

      return {
        success: true,
        anonymizedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('GDPR anonymization error:', error);
      throw error;
    }
  }

  async getDataRetentionReport() {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_participants,
        COUNT(CASE WHEN created_at < datetime('now', '-90 days') THEN 1 END) as older_than_90_days,
        COUNT(CASE WHEN last_seen < datetime('now', '-30 days') THEN 1 END) as inactive_30_days,
        (SELECT COUNT(*) FROM moods) as total_moods,
        (SELECT COUNT(*) FROM chat_history) as total_chat_messages,
        (SELECT COUNT(*) FROM sandbox_apps) as total_apps
      FROM participants
    `);

    return stats;
  }

  async cleanupOldData(daysToKeep = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

    try {
      const moodsDeleted = await db.run(
        'DELETE FROM moods WHERE timestamp < ?',
        [cutoffDate]
      );

      const chatDeleted = await db.run(
        'DELETE FROM chat_history WHERE timestamp < ?',
        [cutoffDate]
      );

      const eventsDeleted = await db.run(
        'DELETE FROM system_events WHERE timestamp < ?',
        [cutoffDate]
      );

      await auditLogger.log('gdpr:cleanup', {
        daysToKeep,
        moodsDeleted: moodsDeleted.changes,
        chatDeleted: chatDeleted.changes,
        eventsDeleted: eventsDeleted.changes
      });

      return {
        moodsDeleted: moodsDeleted.changes,
        chatDeleted: chatDeleted.changes,
        eventsDeleted: eventsDeleted.changes
      };
    } catch (error) {
      console.error('Data cleanup error:', error);
      throw error;
    }
  }
}

export default new GDPRService();
