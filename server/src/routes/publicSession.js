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

// Get class modules for a live session (public - for participants)
router.get('/session/:sessionCode/modules', async (req, res) => {
  try {
    const { sessionCode } = req.params;

    // Find session by code
    const session = await db.get(`
      SELECT s.*, c.name as class_name, c.description as class_description, c.theme_override
      FROM live_sessions s
      JOIN classes c ON s.class_id = c.id
      WHERE s.session_code = ? AND s.status = 'active'
    `, [sessionCode]);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or not active'
      });
    }

    // Get all modules for this class with lock status
    const modules = await db.all(`
      SELECT 
        cm.id as class_module_id,
        cm.order_index,
        cm.is_locked,
        cm.unlocked_at,
        m.id, m.title, m.description, m.category, m.difficulty,
        m.estimated_duration
      FROM class_modules cm
      JOIN modules m ON cm.module_id = m.id
      WHERE cm.class_id = ?
      ORDER BY cm.order_index ASC
    `, [session.class_id]);

    res.json({
      success: true,
      data: {
        session: {
          id: session.id,
          class_id: session.class_id,
          class_name: session.class_name,
          class_description: session.class_description,
          theme_override: session.theme_override ? JSON.parse(session.theme_override) : null
        },
        modules
      }
    });
  } catch (error) {
    console.error('Error fetching session modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session modules'
    });
  }
});

// Send mood feedback from session participant
router.post('/session/:sessionCode/mood', async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const { participantId, mood, moduleId } = req.body;

    // Validate session
    const session = await db.get(`
      SELECT s.* FROM live_sessions s
      WHERE s.session_code = ? AND s.status = 'active'
    `, [sessionCode]);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or not active'
      });
    }

    // Validate participant belongs to this session
    const participant = await db.get(`
      SELECT * FROM session_participants 
      WHERE id = ? AND session_id = ?
    `, [participantId, session.id]);

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: 'Participant not found in this session'
      });
    }

    // Valid moods
    const validMoods = ['confused', 'thinking', 'aha', 'wow', 'pause_request', 'overwhelmed'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mood type'
      });
    }

    // Record the mood (using session_participant_id)
    const moodId = require('uuid').v4();
    await db.run(`
      INSERT INTO session_moods (id, session_id, participant_id, mood, module_id, timestamp)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [moodId, session.id, participantId, mood, moduleId || null]);

    // Emit socket events for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Emit mood update
      io.emit('mood:update', {
        participantId,
        participantName: participant.participant_name,
        mood,
        moduleId,
        sessionCode,
        timestamp: new Date().toISOString()
      });

      // Emit special feedback events
      if (mood === 'pause_request') {
        console.log('⏸️ Broadcasting feedback:pause for session participant');
        io.emit('feedback:pause', {
          participantId,
          nickname: participant.participant_name,
          moduleId,
          sessionCode,
          timestamp: new Date().toISOString()
        });
      } else if (mood === 'overwhelmed') {
        console.log('🚨 Broadcasting feedback:overwhelmed for session participant');
        io.emit('feedback:overwhelmed', {
          participantId,
          nickname: participant.participant_name,
          moduleId,
          sessionCode,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({
      success: true,
      data: {
        id: moodId,
        mood,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error recording session mood:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record mood'
    });
  }
});

// Unlock a module in a live session (admin only)
router.put('/session/:sessionCode/modules/:classModuleId/unlock', async (req, res) => {
  try {
    const { sessionCode, classModuleId } = req.params;

    // Find session by code
    const session = await db.get(`
      SELECT s.* FROM live_sessions s
      WHERE s.session_code = ? AND s.status = 'active'
    `, [sessionCode]);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or not active'
      });
    }

    // Unlock the module
    await db.run(
      'UPDATE class_modules SET is_locked = 0, unlocked_at = ? WHERE id = ?',
      [new Date().toISOString(), classModuleId]
    );

    res.json({
      success: true,
      message: 'Module unlocked'
    });
  } catch (error) {
    console.error('Error unlocking module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlock module'
    });
  }
});

export default router;
