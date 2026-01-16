import express from 'express';
import ollamaService from '../services/ollamaService.js';
import participantService from '../services/participantService.js';
import db from '../services/database.js';

const router = express.Router();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No session token provided'
      });
    }

    const sessionToken = authHeader.substring(7);
    const participant = await participantService.getParticipantByToken(sessionToken);

    if (!participant) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session token'
      });
    }

    req.participant = participant;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

router.post('/message', authenticate, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 500 characters)'
      });
    }

    const result = await ollamaService.chat(
      req.participant.id,
      message,
      conversationHistory || []
    );

    await db.run(
      `INSERT INTO chat_history (participant_id, message, response, response_time, timestamp)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [req.participant.id, message, result.response, result.responseTime || 0]
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process chat message'
    });
  }
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const history = await db.all(
      `SELECT message, response, response_time, timestamp
       FROM chat_history
       WHERE participant_id = ?
       ORDER BY timestamp DESC
       LIMIT ?`,
      [req.participant.id, limit]
    );

    res.json({
      success: true,
      data: history.reverse()
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
});

router.get('/status', async (req, res) => {
  try {
    const isAvailable = await ollamaService.checkOllamaAvailability();

    res.json({
      success: true,
      data: {
        available: isAvailable,
        model: ollamaService.model,
        rateLimit: ollamaService.maxRequestsPerMinute
      }
    });

  } catch (error) {
    console.error('Error checking Ollama status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check status'
    });
  }
});

export default router;
