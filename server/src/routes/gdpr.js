import express from 'express';
import gdprService from '../services/gdprService.js';
import participantService from '../services/participantService.js';
import { requireAdmin } from '../middleware/adminAuth.js';

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

router.get('/export', authenticate, async (req, res) => {
  try {
    const data = await gdprService.exportUserData(req.participant.id);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=my-data-${Date.now()}.json`);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('GDPR export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
});

router.post('/delete', authenticate, async (req, res) => {
  try {
    const { keepAnonymizedData, deleteApps, deleteChatHistory } = req.body;
    
    const result = await gdprService.deleteUserData(req.participant.id, {
      keepAnonymizedData,
      deleteApps,
      deleteChatHistory
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('GDPR deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete data'
    });
  }
});

router.post('/anonymize', authenticate, async (req, res) => {
  try {
    const result = await gdprService.anonymizeUserData(req.participant.id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('GDPR anonymization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to anonymize data'
    });
  }
});

router.get('/admin/report', requireAdmin, async (req, res) => {
  try {
    const report = await gdprService.getDataRetentionReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('GDPR report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

router.post('/admin/cleanup', requireAdmin, async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;
    
    const result = await gdprService.cleanupOldData(daysToKeep);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('GDPR cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup data'
    });
  }
});

export default router;
