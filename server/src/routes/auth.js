import express from 'express';
import participantService from '../services/participantService.js';
import eventBus from '../eventBus.js';

const router = express.Router();

router.post('/join', async (req, res) => {
  try {
    const { nickname } = req.body;

    const participant = await participantService.createParticipant(nickname);

    eventBus.emitParticipantJoined(participant.participantId, {
      nickname: participant.nickname,
      avatarSeed: participant.avatarSeed
    });

    console.log(`👤 New participant joined: ${participant.participantId} (${nickname || 'Anonymous'})`);

    res.status(201).json({
      success: true,
      data: {
        participantId: participant.participantId,
        sessionToken: participant.sessionToken,
        nickname: participant.nickname,
        avatarSeed: participant.avatarSeed
      }
    });
  } catch (error) {
    console.error('Error creating participant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create participant session'
    });
  }
});

router.get('/session', async (req, res) => {
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

    await participantService.updateLastSeen(participant.id);

    const progress = await participantService.getParticipantProgress(participant.id);

    res.json({
      success: true,
      data: {
        participantId: participant.id,
        nickname: participant.nickname,
        avatarSeed: participant.avatar_seed,
        progress
      }
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session'
    });
  }
});

export default router;
