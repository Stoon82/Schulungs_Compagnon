import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../services/database.js';
import { storeAdminSession } from '../middleware/adminAuth.js';

const router = express.Router();

const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function generateAdminToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate a random 6-digit session code
function generateSessionCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// ADMIN AUTHENTICATION
// ============================================

// Register new admin
router.post('/admin/register', async (req, res) => {
  try {
    const { username, password, email, displayName } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Check if username already exists
    const existing = await db.get('SELECT id FROM admin_users WHERE username = ?', [username]);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await db.run(`
      INSERT INTO admin_users (id, username, password_hash, email, display_name)
      VALUES (?, ?, ?, ?, ?)
    `, [id, username, passwordHash, email || null, displayName || username]);

    res.status(201).json({
      success: true,
      data: {
        id,
        username,
        displayName: displayName || username
      }
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register admin'
    });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const admin = await db.get('SELECT * FROM admin_users WHERE username = ? AND is_active = 1', [username]);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await db.run('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

    // Generate authentication token
    const token = generateAdminToken();
    const expiresAt = Date.now() + ADMIN_SESSION_DURATION;

    // Store session in shared adminAuth storage
    storeAdminSession(token, {
      adminId: admin.id,
      username: admin.username,
      createdAt: Date.now(),
      expiresAt,
      lastActivity: Date.now()
    });

    res.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        displayName: admin.display_name,
        email: admin.email,
        token: token
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log in'
    });
  }
});

// ============================================
// CLASS MANAGEMENT
// ============================================

// Get all classes for an admin
router.get('/admin/:adminId/classes', async (req, res) => {
  try {
    const { adminId } = req.params;

    // Get classes created by admin or shared with admin
    const classes = await db.all(`
      SELECT DISTINCT c.*, m.title as module_title,
        CASE 
          WHEN c.created_by = ? THEN 'owner'
          ELSE cs.permission_level
        END as access_level
      FROM classes c
      LEFT JOIN modules m ON c.module_id = m.id
      LEFT JOIN class_shares cs ON c.id = cs.class_id AND cs.shared_with_admin_id = ?
      WHERE c.created_by = ? OR cs.shared_with_admin_id = ?
      ORDER BY c.created_at DESC
    `, [adminId, adminId, adminId, adminId]);

    res.json({
      success: true,
      data: classes.map(c => ({
        ...c,
        theme_override: c.theme_override ? JSON.parse(c.theme_override) : null
      }))
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes'
    });
  }
});

// Get single class by ID
router.get('/classes/:classId', async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await db.get(`
      SELECT c.*, au.display_name as creator_name
      FROM classes c
      LEFT JOIN admin_users au ON c.created_by = au.id
      WHERE c.id = ?
    `, [classId]);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...classData,
        theme_override: classData.theme_override ? JSON.parse(classData.theme_override) : null
      }
    });
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class'
    });
  }
});

// Create new class
router.post('/admin/:adminId/classes', async (req, res) => {
  try {
    const { adminId } = req.params;
    const { name, description, moduleId, startDate, endDate, maxParticipants, themeOverride } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required'
      });
    }

    const id = uuidv4();

    await db.run(`
      INSERT INTO classes (id, name, description, created_by, module_id, start_date, end_date, max_participants, theme_override)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, description || null, adminId, moduleId || null, startDate || null, endDate || null, maxParticipants || null, themeOverride ? JSON.stringify(themeOverride) : null]);

    const newClass = await db.get('SELECT * FROM classes WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: newClass
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create class'
    });
  }
});

// Update class
router.put('/classes/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { name, description, moduleId, startDate, endDate, maxParticipants, isActive, themeOverride } = req.body;

    await db.run(`
      UPDATE classes 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          module_id = COALESCE(?, module_id),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          max_participants = COALESCE(?, max_participants),
          is_active = COALESCE(?, is_active),
          theme_override = COALESCE(?, theme_override),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description, moduleId, startDate, endDate, maxParticipants, isActive, themeOverride ? JSON.stringify(themeOverride) : null, classId]);

    const updatedClass = await db.get('SELECT * FROM classes WHERE id = ?', [classId]);

    res.json({
      success: true,
      data: updatedClass
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update class'
    });
  }
});

// Delete class
router.delete('/classes/:classId', async (req, res) => {
  try {
    const { classId } = req.params;

    await db.run('DELETE FROM classes WHERE id = ?', [classId]);

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete class'
    });
  }
});

// Share class with another admin
router.post('/classes/:classId/share', async (req, res) => {
  try {
    const { classId } = req.params;
    const { sharedWithAdminId, permissionLevel, sharedBy } = req.body;

    if (!sharedWithAdminId || !sharedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const id = uuidv4();

    await db.run(`
      INSERT INTO class_shares (id, class_id, shared_with_admin_id, permission_level, shared_by)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(class_id, shared_with_admin_id) 
      DO UPDATE SET permission_level = ?, shared_at = CURRENT_TIMESTAMP
    `, [id, classId, sharedWithAdminId, permissionLevel || 'view', sharedBy, permissionLevel || 'view']);

    res.status(201).json({
      success: true,
      message: 'Class shared successfully'
    });
  } catch (error) {
    console.error('Error sharing class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share class'
    });
  }
});

// ============================================
// LIVE SESSION MANAGEMENT
// ============================================

// Start a new live session
router.post('/sessions/start', async (req, res) => {
  try {
    const { classId, startedBy, presentationMode } = req.body;

    if (!classId || !startedBy) {
      return res.status(400).json({
        success: false,
        error: 'Class ID and admin ID are required'
      });
    }

    // Verify class exists
    const classData = await db.get('SELECT * FROM classes WHERE id = ? AND is_active = 1', [classId]);
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found or inactive'
      });
    }

    const id = uuidv4();
    const sessionCode = generateSessionCode();

    await db.run(`
      INSERT INTO live_sessions (id, class_id, session_code, started_by, presentation_mode)
      VALUES (?, ?, ?, ?, ?)
    `, [id, classId, sessionCode, startedBy, presentationMode || 'manual']);

    // Get session with class info
    const session = await db.get(`
      SELECT s.*, c.name as class_name, c.description as class_description,
             c.theme_override
      FROM live_sessions s
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    // Get all modules assigned to this class
    const classModules = await db.all(`
      SELECT 
        cm.id as class_module_id,
        cm.order_index,
        cm.is_locked,
        cm.unlocked_at,
        m.id, m.title, m.description, m.category, m.difficulty,
        m.estimated_duration, m.author
      FROM class_modules cm
      JOIN modules m ON cm.module_id = m.id
      WHERE cm.class_id = ?
      ORDER BY cm.order_index ASC
    `, [classId]);

    // Parse theme_override if exists
    const themeOverride = session.theme_override ? JSON.parse(session.theme_override) : null;

    res.status(201).json({
      success: true,
      data: {
        ...session,
        theme_override: themeOverride,
        modules: classModules,
        // For backwards compatibility, set module_id to first unlocked module
        module_id: classModules.find(m => !m.is_locked)?.id || classModules[0]?.id || null
      }
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start session'
    });
  }
});

// Get active sessions for a class
router.get('/classes/:classId/sessions', async (req, res) => {
  try {
    const { classId } = req.params;

    const sessions = await db.all(`
      SELECT s.*, 
        COUNT(DISTINCT p.id) as participant_count,
        c.name as class_name,
        m.title as module_title
      FROM live_sessions s
      LEFT JOIN session_participants p ON s.id = p.session_id AND p.is_online = 1
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN modules m ON c.module_id = m.id
      WHERE s.class_id = ? AND s.status = 'active'
      GROUP BY s.id
      ORDER BY s.started_at DESC
    `, [classId]);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions'
    });
  }
});

// Get session by code (for clients to join)
router.get('/sessions/code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const session = await db.get(`
      SELECT s.*, c.module_id, c.name as class_name, c.description as class_description,
        c.theme_override, m.title as module_title
      FROM live_sessions s
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN modules m ON c.module_id = m.id
      WHERE s.session_code = ? AND s.status = 'active'
    `, [code]);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or ended'
      });
    }

    // Fetch modules for multi-module classes
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

    // Parse theme_override if it exists
    const themeOverride = session.theme_override ? JSON.parse(session.theme_override) : null;

    res.json({
      success: true,
      data: {
        ...session,
        theme_override: themeOverride,
        modules: modules.length > 0 ? modules : undefined
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session'
    });
  }
});

// Join session as participant
router.post('/sessions/:sessionId/join', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { participantName } = req.body;

    if (!participantName) {
      return res.status(400).json({
        success: false,
        error: 'Participant name is required'
      });
    }

    const id = uuidv4();

    await db.run(`
      INSERT INTO session_participants (id, session_id, participant_name)
      VALUES (?, ?, ?)
    `, [id, sessionId, participantName]);

    // Log activity
    await db.run(`
      INSERT INTO session_activity (id, session_id, participant_id, activity_type)
      VALUES (?, ?, ?, 'join')
    `, [uuidv4(), sessionId, id]);

    const participant = await db.get('SELECT * FROM session_participants WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join session'
    });
  }
});

// Get session participants
router.get('/sessions/:sessionId/participants', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const participants = await db.all(`
      SELECT * FROM session_participants 
      WHERE session_id = ? 
      ORDER BY joined_at DESC
    `, [sessionId]);

    res.json({
      success: true,
      data: participants
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participants'
    });
  }
});

// Update participant role
router.put('/sessions/:sessionId/participants/:participantId/role', async (req, res) => {
  try {
    const { sessionId, participantId } = req.params;
    const { role } = req.body;

    if (!['participant', 'moderator', 'co-moderator', 'co-admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    await db.run(`
      UPDATE session_participants 
      SET role = ? 
      WHERE id = ? AND session_id = ?
    `, [role, participantId, sessionId]);

    // Log activity
    await db.run(`
      INSERT INTO session_activity (id, session_id, participant_id, activity_type, activity_data)
      VALUES (?, ?, ?, 'role_change', ?)
    `, [uuidv4(), sessionId, participantId, JSON.stringify({ newRole: role })]);

    res.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role'
    });
  }
});

// Update session navigation
router.put('/sessions/:sessionId/navigate', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { submoduleId, submoduleIndex } = req.body;

    await db.run(`
      UPDATE live_sessions 
      SET current_submodule_id = ?, current_submodule_index = ?
      WHERE id = ?
    `, [submoduleId, submoduleIndex, sessionId]);

    res.json({
      success: true,
      message: 'Navigation updated'
    });
  } catch (error) {
    console.error('Error updating navigation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update navigation'
    });
  }
});

// Get session state for polling (fallback for socket events)
router.get('/sessions/state/:sessionCode/:moduleId', async (req, res) => {
  try {
    const { sessionCode, moduleId } = req.params;
    
    // Get the current allowed index from session_module_state table or session
    const state = await db.get(`
      SELECT allowed_index FROM session_module_state 
      WHERE session_code = ? AND module_id = ?
    `, [sessionCode, moduleId]);
    
    if (state) {
      res.json({
        success: true,
        allowedIndex: state.allowed_index
      });
    } else {
      // No state found, return 0 (first submodule)
      res.json({
        success: true,
        allowedIndex: 0
      });
    }
  } catch (error) {
    console.error('Error getting session state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session state'
    });
  }
});

// Admin advances submodule - broadcasts to all clients via server
router.post('/sessions/advance', async (req, res) => {
  try {
    const { sessionCode, moduleId, allowedIndex } = req.body;
    
    console.log(`📍 [API] Submodule advance request - Session: ${sessionCode}, Module: ${moduleId}, AllowedIndex: ${allowedIndex}`);
    
    // Save to database for polling fallback
    // First ensure the table exists
    await db.run(`
      CREATE TABLE IF NOT EXISTS session_module_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_code TEXT NOT NULL,
        module_id TEXT NOT NULL,
        allowed_index INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_code, module_id)
      )
    `);
    
    // Upsert the state
    await db.run(`
      INSERT INTO session_module_state (session_code, module_id, allowed_index, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(session_code, module_id) 
      DO UPDATE SET allowed_index = ?, updated_at = CURRENT_TIMESTAMP
    `, [sessionCode, moduleId, allowedIndex, allowedIndex]);
    
    console.log(`📍 [API] Saved state to DB: sessionCode=${sessionCode}, moduleId=${moduleId}, allowedIndex=${allowedIndex}`);
    
    // Get the io instance from the app
    const io = req.app.get('io');
    
    if (io) {
      // Log connected clients count
      const connectedSockets = io.sockets.sockets.size;
      console.log(`📍 [API] Connected clients: ${connectedSockets}`);
      
      // Broadcast to ALL connected clients
      io.emit('submodule:advance', {
        sessionCode,
        moduleId,
        allowedIndex
      });
      console.log(`📍 [API] Broadcasted submodule:advance to ${connectedSockets} clients`);
    } else {
      console.warn('📍 [API] Socket.io not available');
    }

    res.json({
      success: true,
      message: 'Advance broadcasted and saved'
    });
  } catch (error) {
    console.error('Error broadcasting advance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast advance'
    });
  }
});

// Admin forces all clients to a specific position
router.post('/sessions/force-sync', async (req, res) => {
  try {
    const { sessionCode, moduleId, targetIndex } = req.body;
    
    console.log(`📍 [API] Force sync request - Session: ${sessionCode}, Module: ${moduleId}, TargetIndex: ${targetIndex}`);
    
    // Get the io instance from the app
    const io = req.app.get('io');
    
    if (io) {
      const connectedSockets = io.sockets.sockets.size;
      console.log(`📍 [API] Connected clients: ${connectedSockets}`);
      
      // Broadcast force navigation to ALL connected clients
      io.emit('module:force-sync', {
        sessionCode,
        moduleId,
        targetIndex
      });
      console.log(`📍 [API] Broadcasted module:force-sync to ${connectedSockets} clients`);
    }

    res.json({
      success: true,
      message: 'Force sync broadcasted'
    });
  } catch (error) {
    console.error('Error force syncing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to force sync'
    });
  }
});

// Word Cloud - Submit a word
router.post('/wordcloud/submit', async (req, res) => {
  try {
    const { sessionCode, submoduleId, word, participantId } = req.body;
    
    if (!sessionCode || !submoduleId || !word) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Ensure table exists
    await db.run(`
      CREATE TABLE IF NOT EXISTS wordcloud_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_code TEXT NOT NULL,
        submodule_id TEXT NOT NULL,
        word TEXT NOT NULL,
        participant_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert the word
    await db.run(`
      INSERT INTO wordcloud_words (session_code, submodule_id, word, participant_id)
      VALUES (?, ?, ?, ?)
    `, [sessionCode, submoduleId, word.toLowerCase().trim(), participantId || 'admin']);
    
    console.log(`☁️ Word submitted: "${word}" for session ${sessionCode}, submodule ${submoduleId}`);
    
    // Get all words for this submodule
    const words = await db.all(`
      SELECT word, COUNT(*) as count 
      FROM wordcloud_words 
      WHERE session_code = ? AND submodule_id = ?
      GROUP BY word
      ORDER BY count DESC
    `, [sessionCode, submoduleId]);
    
    // Broadcast to all clients via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('wordcloud:update', {
        sessionCode,
        submoduleId,
        words
      });
      console.log(`☁️ Broadcasted wordcloud:update with ${words.length} unique words`);
    }

    res.json({
      success: true,
      words
    });
  } catch (error) {
    console.error('Error submitting word:', error);
    res.status(500).json({ success: false, error: 'Failed to submit word' });
  }
});

// Word Cloud - Get all words for a submodule
router.get('/wordcloud/:sessionCode/:submoduleId', async (req, res) => {
  try {
    const { sessionCode, submoduleId } = req.params;
    
    // Ensure table exists
    await db.run(`
      CREATE TABLE IF NOT EXISTS wordcloud_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_code TEXT NOT NULL,
        submodule_id TEXT NOT NULL,
        word TEXT NOT NULL,
        participant_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const words = await db.all(`
      SELECT word, COUNT(*) as count 
      FROM wordcloud_words 
      WHERE session_code = ? AND submodule_id = ?
      GROUP BY word
      ORDER BY count DESC
    `, [sessionCode, submoduleId]);

    res.json({
      success: true,
      words
    });
  } catch (error) {
    console.error('Error getting words:', error);
    res.status(500).json({ success: false, error: 'Failed to get words' });
  }
});

// Word Cloud - Clear all words (admin only)
router.delete('/wordcloud/:sessionCode/:submoduleId', async (req, res) => {
  try {
    const { sessionCode, submoduleId } = req.params;
    
    await db.run(`
      DELETE FROM wordcloud_words 
      WHERE session_code = ? AND submodule_id = ?
    `, [sessionCode, submoduleId]);
    
    // Broadcast clear to all clients
    const io = req.app.get('io');
    if (io) {
      io.emit('wordcloud:update', {
        sessionCode,
        submoduleId,
        words: []
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing words:', error);
    res.status(500).json({ success: false, error: 'Failed to clear words' });
  }
});

// End session
router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;

    await db.run(`
      UPDATE live_sessions 
      SET status = 'ended', ended_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [sessionId]);

    // Mark all participants as offline
    await db.run(`
      UPDATE session_participants 
      SET is_online = 0 
      WHERE session_id = ?
    `, [sessionId]);

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end session'
    });
  }
});

export default router;
