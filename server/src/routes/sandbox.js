import express from 'express';
import sandboxService from '../services/sandboxService.js';
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

router.post('/create', authenticate, async (req, res) => {
  try {
    const { title, code } = req.body;

    if (!title || !code) {
      return res.status(400).json({
        success: false,
        error: 'Title and code are required'
      });
    }

    const app = await sandboxService.createApp(req.participant.id, title, code);

    res.status(201).json({
      success: true,
      data: app
    });
  } catch (error) {
    console.error('Error creating app:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create app'
    });
  }
});

router.get('/gallery', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const apps = await sandboxService.getAllApps(limit);

    res.json({
      success: true,
      data: apps
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gallery'
    });
  }
});

router.get('/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await sandboxService.getApp(appId);

    if (!app) {
      return res.status(404).json({
        success: false,
        error: 'App not found'
      });
    }

    res.json({
      success: true,
      data: app
    });
  } catch (error) {
    console.error('Error fetching app:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch app'
    });
  }
});

router.post('/:appId/vote', authenticate, async (req, res) => {
  try {
    const { appId } = req.params;
    const { voteType } = req.body;

    if (!voteType || !['up', 'down'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid vote type (up/down) is required'
      });
    }

    const result = await sandboxService.voteApp(appId, req.participant.id, voteType);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to vote'
    });
  }
});

router.get('/:appId/votes', async (req, res) => {
  try {
    const { appId } = req.params;
    const votes = await sandboxService.getAppVotes(appId);

    res.json({
      success: true,
      data: votes
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch votes'
    });
  }
});

export default router;
