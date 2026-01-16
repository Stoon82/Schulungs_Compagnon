import express from 'express';
import adminService from '../services/adminService.js';
import { adminLogin, adminLogout, requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/logout', requireAdmin, adminLogout);

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

router.get('/participants', requireAdmin, async (req, res) => {
  try {
    const participants = await adminService.getParticipantsList();
    res.json({ success: true, data: participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch participants' });
  }
});

router.get('/participants/:id', requireAdmin, async (req, res) => {
  try {
    const details = await adminService.getParticipantDetails(req.params.id);
    res.json({ success: true, data: details });
  } catch (error) {
    console.error('Error fetching participant details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analytics/moods', requireAdmin, async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '1 hour';
    const data = await adminService.getMoodAnalytics(timeRange);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching mood analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

router.get('/analytics/engagement', requireAdmin, async (req, res) => {
  try {
    const data = await adminService.getEngagementHeatmap();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching engagement data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch engagement data' });
  }
});

router.post('/modules/unlock', requireAdmin, async (req, res) => {
  try {
    const { participantId, moduleId, unlockForAll } = req.body;

    if (!moduleId) {
      return res.status(400).json({ success: false, error: 'Module ID is required' });
    }

    let result;
    if (unlockForAll) {
      result = await adminService.unlockModuleForAll(moduleId);
    } else {
      if (!participantId) {
        return res.status(400).json({ success: false, error: 'Participant ID is required' });
      }
      result = await adminService.unlockModuleForParticipant(participantId, moduleId);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error unlocking module:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/broadcast', requireAdmin, async (req, res) => {
  try {
    const { message, type } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const result = await adminService.broadcastMessage(message, type);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({ success: false, error: 'Failed to broadcast message' });
  }
});

router.post('/participants/:id/kick', requireAdmin, async (req, res) => {
  try {
    const result = await adminService.kickParticipant(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error kicking participant:', error);
    res.status(500).json({ success: false, error: 'Failed to kick participant' });
  }
});

router.post('/system/pause', requireAdmin, async (req, res) => {
  try {
    const result = await adminService.pauseSystem();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error pausing system:', error);
    res.status(500).json({ success: false, error: 'Failed to pause system' });
  }
});

router.post('/system/resume', requireAdmin, async (req, res) => {
  try {
    const result = await adminService.resumeSystem();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error resuming system:', error);
    res.status(500).json({ success: false, error: 'Failed to resume system' });
  }
});

router.post('/codes/generate', requireAdmin, async (req, res) => {
  try {
    const { moduleId, description } = req.body;

    if (!moduleId || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Module ID and description are required' 
      });
    }

    const result = await adminService.generateSecretCode(moduleId, description);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ success: false, error: 'Failed to generate code' });
  }
});

router.get('/codes', requireAdmin, async (req, res) => {
  try {
    const codes = await adminService.getSecretCodes();
    res.json({ success: true, data: codes });
  } catch (error) {
    console.error('Error fetching codes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch codes' });
  }
});

router.post('/codes/:code/deactivate', requireAdmin, async (req, res) => {
  try {
    const result = await adminService.deactivateSecretCode(req.params.code);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deactivating code:', error);
    res.status(500).json({ success: false, error: 'Failed to deactivate code' });
  }
});

router.post('/apps/:id/feature', requireAdmin, async (req, res) => {
  try {
    const { featured } = req.body;
    const result = await adminService.toggleAppFeatured(req.params.id, featured);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error toggling app featured:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle featured' });
  }
});

router.post('/apps/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    const result = await adminService.deactivateApp(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deactivating app:', error);
    res.status(500).json({ success: false, error: 'Failed to deactivate app' });
  }
});

router.get('/logs', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await adminService.getAdminLogs(limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
});

router.get('/export', requireAdmin, async (req, res) => {
  try {
    const type = req.query.type || 'all';
    const data = await adminService.exportData(type);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=compagnon-export-${Date.now()}.json`);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
});

export default router;
