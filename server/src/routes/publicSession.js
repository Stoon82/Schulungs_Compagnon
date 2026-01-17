import express from 'express';
import db from '../services/database.js';

const router = express.Router();

// ============================================
// PUBLIC SESSION ENDPOINTS
// No authentication required - only valid session code
// ============================================

// Middleware to verify session code
const verifySessionCode = async (req, res, next) => {
  try {
    const sessionCode = req.headers['x-session-code'] || req.query.sessionCode;
    
    if (!sessionCode) {
      return res.status(400).json({
        success: false,
        error: 'Session code required'
      });
    }

    const session = await db.get(
      'SELECT * FROM live_sessions WHERE session_code = ? AND status = ?',
      [sessionCode, 'active']
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired session code'
      });
    }

    req.session = session;
    next();
  } catch (error) {
    console.error('Error verifying session code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify session'
    });
  }
};

// GET /api/public-session/module/:moduleId - Get module data (public)
router.get('/module/:moduleId', verifySessionCode, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // Verify this module belongs to the session
    if (req.session.module_id && req.session.module_id !== moduleId) {
      return res.status(403).json({
        success: false,
        error: 'Module not part of this session'
      });
    }
    
    const module = await db.get('SELECT * FROM modules WHERE id = ?', [moduleId]);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...module,
        prerequisites: module.prerequisites ? JSON.parse(module.prerequisites) : [],
        learning_objectives: module.learning_objectives ? JSON.parse(module.learning_objectives) : [],
        theme_override: module.theme_override ? JSON.parse(module.theme_override) : null
      }
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch module'
    });
  }
});

// GET /api/public-session/module/:moduleId/submodules - Get submodules (public)
router.get('/module/:moduleId/submodules', verifySessionCode, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // Verify this module belongs to the session
    if (req.session.module_id && req.session.module_id !== moduleId) {
      return res.status(403).json({
        success: false,
        error: 'Module not part of this session'
      });
    }
    
    const submodules = await db.all(
      'SELECT * FROM submodules WHERE module_id = ? ORDER BY order_index ASC',
      [moduleId]
    );
    
    res.json({
      success: true,
      data: submodules.map(s => ({
        ...s,
        content: s.content ? JSON.parse(s.content) : null,
        styling: s.styling ? JSON.parse(s.styling) : null
      }))
    });
  } catch (error) {
    console.error('Error fetching submodules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submodules'
    });
  }
});

// GET /api/public-session/session/:sessionId - Get session info (public)
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await db.get(`
      SELECT s.*, c.module_id, c.name as class_name, c.description as class_description,
        m.title as module_title
      FROM live_sessions s
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN modules m ON c.module_id = m.id
      WHERE s.id = ? AND s.status = 'active'
    `, [sessionId]);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or ended'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session'
    });
  }
});

export default router;
