import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../services/database.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Middleware for admin authentication
const requireAdmin = (req, res, next) => {
  // Check if user is authenticated and has admin role
  // This assumes you have session/JWT middleware that sets req.user
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'trainer') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  
  next();
};

// ============================================================================
// MODULE ROUTES
// ============================================================================

// GET /api/module-creator/modules - List all modules
router.get('/modules', requireAdmin, async (req, res) => {
  try {
    const { category, published, search } = req.query;
    
    let query = 'SELECT * FROM modules WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (published !== undefined) {
      query += ' AND is_published = ?';
      params.push(published === 'true' ? 1 : 0);
    }
    
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY order_index ASC, created_at DESC';
    
    const modules = await db.all(query, params);
    
    res.json({
      success: true,
      data: modules.map(m => ({
        ...m,
        prerequisites: m.prerequisites ? JSON.parse(m.prerequisites) : [],
        learning_objectives: m.learning_objectives ? JSON.parse(m.learning_objectives) : [],
        theme_override: m.theme_override ? JSON.parse(m.theme_override) : null
      }))
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch modules'
    });
  }
});

// GET /api/module-creator/modules/:id - Get single module
router.get('/modules/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const module = await db.get('SELECT * FROM modules WHERE id = ?', [id]);
    
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

// POST /api/module-creator/modules - Create new module
router.post('/modules', requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      estimated_duration,
      prerequisites,
      learning_objectives,
      theme_override,
      author,
      order_index
    } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const id = uuidv4();
    
    await db.run(`
      INSERT INTO modules (
        id, title, description, category, difficulty,
        estimated_duration, prerequisites, learning_objectives,
        theme_override, author, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      title,
      description || null,
      category || null,
      difficulty || null,
      estimated_duration || null,
      prerequisites ? JSON.stringify(prerequisites) : null,
      learning_objectives ? JSON.stringify(learning_objectives) : null,
      theme_override ? JSON.stringify(theme_override) : null,
      author || 'admin',
      order_index || 0
    ]);
    
    const module = await db.get('SELECT * FROM modules WHERE id = ?', [id]);
    
    res.status(201).json({
      success: true,
      data: {
        ...module,
        prerequisites: module.prerequisites ? JSON.parse(module.prerequisites) : [],
        learning_objectives: module.learning_objectives ? JSON.parse(module.learning_objectives) : [],
        theme_override: module.theme_override ? JSON.parse(module.theme_override) : null
      }
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create module'
    });
  }
});

// PUT /api/module-creator/modules/:id - Update module
router.put('/modules/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      difficulty,
      estimated_duration,
      prerequisites,
      learning_objectives,
      theme_override,
      author,
      is_published,
      order_index
    } = req.body;
    
    const existing = await db.get('SELECT * FROM modules WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }
    
    await db.run(`
      UPDATE modules SET
        title = ?,
        description = ?,
        category = ?,
        difficulty = ?,
        estimated_duration = ?,
        prerequisites = ?,
        learning_objectives = ?,
        theme_override = ?,
        author = ?,
        is_published = ?,
        order_index = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title !== undefined ? title : existing.title,
      description !== undefined ? description : existing.description,
      category !== undefined ? category : existing.category,
      difficulty !== undefined ? difficulty : existing.difficulty,
      estimated_duration !== undefined ? estimated_duration : existing.estimated_duration,
      prerequisites !== undefined ? JSON.stringify(prerequisites) : existing.prerequisites,
      learning_objectives !== undefined ? JSON.stringify(learning_objectives) : existing.learning_objectives,
      theme_override !== undefined ? JSON.stringify(theme_override) : existing.theme_override,
      author !== undefined ? author : existing.author,
      is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
      order_index !== undefined ? order_index : existing.order_index,
      id
    ]);
    
    const module = await db.get('SELECT * FROM modules WHERE id = ?', [id]);
    
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
    console.error('Error updating module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update module'
    });
  }
});

// DELETE /api/module-creator/modules/:id - Delete module
router.delete('/modules/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await db.get('SELECT * FROM modules WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }
    
    await db.run('DELETE FROM modules WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete module'
    });
  }
});

// ============================================================================
// SUBMODULE ROUTES
// ============================================================================

// GET /api/module-creator/modules/:moduleId/submodules - List submodules
router.get('/modules/:moduleId/submodules', requireAdmin, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
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

// GET /api/module-creator/submodules/:id - Get single submodule
router.get('/submodules/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const submodule = await db.get('SELECT * FROM submodules WHERE id = ?', [id]);
    
    if (!submodule) {
      return res.status(404).json({
        success: false,
        error: 'Submodule not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...submodule,
        content: submodule.content ? JSON.parse(submodule.content) : null,
        styling: submodule.styling ? JSON.parse(submodule.styling) : null
      }
    });
  } catch (error) {
    console.error('Error fetching submodule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submodule'
    });
  }
});

// POST /api/module-creator/modules/:moduleId/submodules - Create submodule
router.post('/modules/:moduleId/submodules', requireAdmin, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      template_type,
      content,
      styling,
      duration_estimate,
      notes,
      order_index
    } = req.body;
    
    if (!title || !template_type) {
      return res.status(400).json({
        success: false,
        error: 'Title and template_type are required'
      });
    }
    
    const id = uuidv4();
    
    await db.run(`
      INSERT INTO submodules (
        id, module_id, title, template_type, content,
        styling, duration_estimate, notes, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      moduleId,
      title,
      template_type,
      content ? JSON.stringify(content) : null,
      styling ? JSON.stringify(styling) : null,
      duration_estimate || null,
      notes || null,
      order_index || 0
    ]);
    
    const submodule = await db.get('SELECT * FROM submodules WHERE id = ?', [id]);
    
    res.status(201).json({
      success: true,
      data: {
        ...submodule,
        content: submodule.content ? JSON.parse(submodule.content) : null,
        styling: submodule.styling ? JSON.parse(submodule.styling) : null
      }
    });
  } catch (error) {
    console.error('Error creating submodule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create submodule'
    });
  }
});

// PUT /api/module-creator/submodules/:id - Update submodule
router.put('/submodules/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      template_type,
      content,
      styling,
      duration_estimate,
      notes,
      order_index
    } = req.body;
    
    const existing = await db.get('SELECT * FROM submodules WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Submodule not found'
      });
    }
    
    await db.run(`
      UPDATE submodules SET
        title = ?,
        template_type = ?,
        content = ?,
        styling = ?,
        duration_estimate = ?,
        notes = ?,
        order_index = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title !== undefined ? title : existing.title,
      template_type !== undefined ? template_type : existing.template_type,
      content !== undefined ? JSON.stringify(content) : existing.content,
      styling !== undefined ? JSON.stringify(styling) : existing.styling,
      duration_estimate !== undefined ? duration_estimate : existing.duration_estimate,
      notes !== undefined ? notes : existing.notes,
      order_index !== undefined ? order_index : existing.order_index,
      id
    ]);
    
    const submodule = await db.get('SELECT * FROM submodules WHERE id = ?', [id]);
    
    res.json({
      success: true,
      data: {
        ...submodule,
        content: submodule.content ? JSON.parse(submodule.content) : null,
        styling: submodule.styling ? JSON.parse(submodule.styling) : null
      }
    });
  } catch (error) {
    console.error('Error updating submodule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update submodule'
    });
  }
});

// DELETE /api/module-creator/submodules/:id - Delete submodule
router.delete('/submodules/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await db.get('SELECT * FROM submodules WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Submodule not found'
      });
    }
    
    await db.run('DELETE FROM submodules WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Submodule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submodule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete submodule'
    });
  }
});

// PUT /api/module-creator/submodules/reorder - Reorder submodules
router.put('/submodules/reorder', requireAdmin, async (req, res) => {
  try {
    const { submodules } = req.body; // Array of { id, order_index }
    
    if (!Array.isArray(submodules)) {
      return res.status(400).json({
        success: false,
        error: 'submodules must be an array'
      });
    }
    
    // Update each submodule's order_index
    for (const { id, order_index } of submodules) {
      await db.run(
        'UPDATE submodules SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [order_index, id]
      );
    }
    
    res.json({
      success: true,
      message: 'Submodules reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering submodules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder submodules'
    });
  }
});

// ============================================================================
// MEDIA ROUTES
// ============================================================================

// GET /api/module-creator/media - List media assets
router.get('/media', requireAdmin, async (req, res) => {
  try {
    const { mime_type, tags, search } = req.query;
    
    let query = 'SELECT * FROM media_assets WHERE 1=1';
    const params = [];
    
    if (mime_type) {
      query += ' AND mime_type LIKE ?';
      params.push(`${mime_type}%`);
    }
    
    if (tags) {
      query += ' AND tags LIKE ?';
      params.push(`%${tags}%`);
    }
    
    if (search) {
      query += ' AND (filename LIKE ? OR original_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const media = await db.all(query, params);
    
    res.json({
      success: true,
      data: media.map(m => ({
        ...m,
        tags: m.tags ? JSON.parse(m.tags) : []
      }))
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media'
    });
  }
});

// POST /api/module-creator/media/upload - Upload media file
router.post('/media/upload', requireAdmin, uploadSingle, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const id = uuidv4();
    const { originalname, filename, mimetype, size } = req.file;
    const storagePath = `/uploads/${filename}`;

    await db.run(`
      INSERT INTO media_assets (
        id, filename, original_name, mime_type, size,
        storage_type, storage_path, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      filename,
      originalname,
      mimetype,
      size,
      'local',
      storagePath,
      'admin' // TODO: Get from auth context
    ]);

    const media = await db.get('SELECT * FROM media_assets WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: {
        ...media,
        url: storagePath,
        tags: media.tags ? JSON.parse(media.tags) : []
      }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload media'
    });
  }
});

// DELETE /api/module-creator/media/:id - Delete media asset
router.delete('/media/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await db.get('SELECT * FROM media_assets WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Media asset not found'
      });
    }
    
    // TODO: Delete actual file from storage
    
    await db.run('DELETE FROM media_assets WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Media asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete media'
    });
  }
});

// ============================================================================
// MEDIA ROUTES
// ============================================================================

// GET /api/module-creator/media/:id/thumbnail - Get media thumbnail
router.get('/media/:id/thumbnail', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { width = 200, height = 200 } = req.query;
    
    // Get media info from database
    const media = await db.get('SELECT * FROM media WHERE id = ?', [id]);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }
    
    // Return media URL (thumbnail generation with sharp can be added later if needed)
    res.json({
      success: true,
      data: {
        id: media.id,
        thumbnailUrl: media.url,
        width: parseInt(width),
        height: parseInt(height),
        type: media.type
      }
    });
  } catch (error) {
    console.error('Error fetching media thumbnail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media thumbnail'
    });
  }
});

// ============================================================================
// QUIZ RESPONSE ROUTES
// ============================================================================

// POST /api/module-creator/quiz/:submoduleId/submit - Store quiz response
router.post('/quiz/:submoduleId/submit', async (req, res) => {
  try {
    const { submoduleId } = req.params;
    const { sessionId, userId, questionId, answer, isCorrect, timeTaken } = req.body;

    if (!answer) {
      return res.status(400).json({
        success: false,
        error: 'Answer is required'
      });
    }

    await db.run(
      'INSERT INTO quiz_responses (id, session_id, user_id, question_id, answer, is_correct, time_taken, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        uuidv4(),
        sessionId || null,
        userId || null,
        questionId || submoduleId,
        JSON.stringify(answer),
        isCorrect ? 1 : 0,
        timeTaken || null,
        new Date().toISOString()
      ]
    );

    res.json({
      success: true,
      message: 'Quiz response recorded successfully'
    });
  } catch (error) {
    console.error('Error storing quiz response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store quiz response'
    });
  }
});

// GET /api/module-creator/quiz/:submoduleId/results - Get quiz results
router.get('/quiz/:submoduleId/results', async (req, res) => {
  try {
    const { submoduleId } = req.params;
    const { sessionId } = req.query;

    let query = `
      SELECT 
        answer,
        is_correct,
        COUNT(*) as count,
        AVG(time_taken) as avg_time
      FROM quiz_responses 
      WHERE question_id = ?
    `;
    const params = [submoduleId];

    if (sessionId) {
      query += ' AND session_id = ?';
      params.push(sessionId);
    }

    query += ' GROUP BY answer, is_correct';

    const results = await db.all(query, params);

    // Calculate score statistics
    const totalResponses = results.reduce((sum, r) => sum + r.count, 0);
    const correctResponses = results
      .filter(r => r.is_correct === 1)
      .reduce((sum, r) => sum + r.count, 0);
    
    const scorePercentage = totalResponses > 0 
      ? Math.round((correctResponses / totalResponses) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        responses: results,
        statistics: {
          total: totalResponses,
          correct: correctResponses,
          incorrect: totalResponses - correctResponses,
          scorePercentage
        }
      }
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz results'
    });
  }
});

// ============================================================================
// POLL RESULTS ROUTES
// ============================================================================

// POST /api/module-creator/polls/:submoduleId/vote - Store poll vote
router.post('/polls/:submoduleId/vote', async (req, res) => {
  try {
    const { submoduleId } = req.params;
    const { sessionId, userId, optionSelected } = req.body;

    if (!optionSelected) {
      return res.status(400).json({
        success: false,
        error: 'Option selected is required'
      });
    }

    await db.run(
      'INSERT INTO poll_results (id, submodule_id, session_id, user_id, option_selected, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), submoduleId, sessionId || null, userId || null, optionSelected, new Date().toISOString()]
    );

    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error storing poll vote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store poll vote'
    });
  }
});

// GET /api/module-creator/polls/:submoduleId/results - Get poll results
router.get('/polls/:submoduleId/results', async (req, res) => {
  try {
    const { submoduleId } = req.params;
    const { sessionId } = req.query;

    let query = 'SELECT option_selected, COUNT(*) as count FROM poll_results WHERE submodule_id = ?';
    const params = [submoduleId];

    if (sessionId) {
      query += ' AND session_id = ?';
      params.push(sessionId);
    }

    query += ' GROUP BY option_selected';

    const results = await db.all(query, params);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch poll results'
    });
  }
});

// ============================================================================
// CLASS-MODULE MANAGEMENT ROUTES
// ============================================================================

// GET /api/module-creator/classes/:classId/modules - Get modules for a class
router.get('/classes/:classId/modules', requireAdmin, async (req, res) => {
  try {
    const { classId } = req.params;
    
    const modules = await db.all(
      `SELECT 
        cm.id as class_module_id,
        cm.order_index,
        cm.is_locked,
        cm.unlocked_at,
        m.*
      FROM class_modules cm
      JOIN modules m ON cm.module_id = m.id
      WHERE cm.class_id = ?
      ORDER BY cm.order_index ASC`,
      [classId]
    );

    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('Error fetching class modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class modules'
    });
  }
});

// POST /api/module-creator/classes/:classId/modules - Add module to class
router.post('/classes/:classId/modules', requireAdmin, async (req, res) => {
  try {
    const { classId } = req.params;
    const { moduleId, orderIndex = 0, isLocked = true } = req.body;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        error: 'Module ID is required'
      });
    }

    const id = uuidv4();
    await db.run(
      `INSERT INTO class_modules (id, class_id, module_id, order_index, is_locked, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, classId, moduleId, orderIndex, isLocked ? 1 : 0, new Date().toISOString()]
    );

    res.json({
      success: true,
      data: { id, classId, moduleId, orderIndex, isLocked }
    });
  } catch (error) {
    console.error('Error adding module to class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add module to class'
    });
  }
});

// DELETE /api/module-creator/classes/:classId/modules/:classModuleId - Remove module from class
router.delete('/classes/:classId/modules/:classModuleId', requireAdmin, async (req, res) => {
  try {
    const { classModuleId } = req.params;

    await db.run('DELETE FROM class_modules WHERE id = ?', [classModuleId]);

    res.json({
      success: true,
      message: 'Module removed from class'
    });
  } catch (error) {
    console.error('Error removing module from class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove module from class'
    });
  }
});

// PUT /api/module-creator/classes/:classId/modules/reorder - Reorder modules in class
router.put('/classes/:classId/modules/reorder', requireAdmin, async (req, res) => {
  try {
    const { classId } = req.params;
    const { moduleOrder } = req.body; // Array of { id, orderIndex }

    if (!Array.isArray(moduleOrder)) {
      return res.status(400).json({
        success: false,
        error: 'Module order must be an array'
      });
    }

    // Update order for each module
    for (const item of moduleOrder) {
      await db.run(
        'UPDATE class_modules SET order_index = ? WHERE id = ? AND class_id = ?',
        [item.orderIndex, item.id, classId]
      );
    }

    res.json({
      success: true,
      message: 'Modules reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering class modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder modules'
    });
  }
});

// PUT /api/module-creator/classes/:classId/modules/:classModuleId/lock - Lock/unlock module
router.put('/classes/:classId/modules/:classModuleId/lock', requireAdmin, async (req, res) => {
  try {
    const { classModuleId } = req.params;
    const { isLocked } = req.body;

    const unlockedAt = !isLocked ? new Date().toISOString() : null;

    await db.run(
      'UPDATE class_modules SET is_locked = ?, unlocked_at = ? WHERE id = ?',
      [isLocked ? 1 : 0, unlockedAt, classModuleId]
    );

    res.json({
      success: true,
      message: isLocked ? 'Module locked' : 'Module unlocked'
    });
  } catch (error) {
    console.error('Error updating module lock status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update module lock status'
    });
  }
});

export default router;
