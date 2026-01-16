import express from 'express';
import moodService from '../services/moodService.js';
import participantService from '../services/participantService.js';

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

router.post('/update', authenticate, async (req, res) => {
  try {
    const { mood, moduleId } = req.body;

    if (!mood) {
      return res.status(400).json({
        success: false,
        error: 'Mood is required'
      });
    }

    const result = await moodService.recordMood(
      req.participant.id,
      mood,
      moduleId || null
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording mood:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to record mood'
    });
  }
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const moods = await moodService.getParticipantMoods(req.participant.id, limit);

    res.json({
      success: true,
      data: moods
    });
  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mood history'
    });
  }
});

export default router;
