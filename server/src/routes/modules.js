import express from 'express';
import moduleService from '../services/moduleService.js';
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

router.get('/', authenticate, async (req, res) => {
  try {
    const modules = await moduleService.getParticipantModules(req.participant.id);

    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch modules'
    });
  }
});

router.post('/:moduleId/complete', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    await moduleService.completeModule(req.participant.id, moduleId);

    res.json({
      success: true,
      message: 'Module marked as completed'
    });
  } catch (error) {
    console.error('Error completing module:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete module'
    });
  }
});

export default router;
