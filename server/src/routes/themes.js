import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../services/database.js';

const router = express.Router();

/**
 * Theme Management Routes
 * Handles saving, loading, and managing themes
 */

// GET /api/themes - Get all themes
router.get('/', async (req, res) => {
  try {
    const themes = await db.all('SELECT * FROM themes ORDER BY created_at DESC');
    
    res.json({
      success: true,
      data: themes.map(t => ({
        ...t,
        theme_data: JSON.parse(t.theme_data)
      }))
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch themes'
    });
  }
});

// GET /api/themes/global/current - Get current global theme (MUST be before /:id route)
router.get('/global/current', async (req, res) => {
  try {
    const theme = await db.get(
      'SELECT * FROM themes WHERE is_global = 1 ORDER BY updated_at DESC LIMIT 1'
    );
    
    if (!theme) {
      return res.json({
        success: true,
        data: null
      });
    }
    
    res.json({
      success: true,
      data: {
        ...theme,
        theme_data: JSON.parse(theme.theme_data)
      }
    });
  } catch (error) {
    console.error('Error fetching global theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global theme'
    });
  }
});

// GET /api/themes/:id - Get specific theme
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const theme = await db.get('SELECT * FROM themes WHERE id = ?', [id]);
    
    if (!theme) {
      return res.status(404).json({
        success: false,
        error: 'Theme not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...theme,
        theme_data: JSON.parse(theme.theme_data)
      }
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch theme'
    });
  }
});

// POST /api/themes/save - Save or update theme
router.post('/save', async (req, res) => {
  try {
    const themeData = req.body;
    const themeId = themeData.id || uuidv4();
    
    // Check if theme exists
    const existing = await db.get('SELECT id FROM themes WHERE id = ?', [themeId]);
    
    if (existing) {
      // Update existing theme
      await db.run(
        'UPDATE themes SET name = ?, theme_data = ?, updated_at = ? WHERE id = ?',
        [themeData.name, JSON.stringify(themeData), new Date().toISOString(), themeId]
      );
    } else {
      // Create new theme
      await db.run(
        'INSERT INTO themes (id, name, theme_data, is_global, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [themeId, themeData.name, JSON.stringify(themeData), 1, new Date().toISOString(), new Date().toISOString()]
      );
    }
    
    res.json({
      success: true,
      data: { id: themeId }
    });
  } catch (error) {
    console.error('Error saving theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save theme'
    });
  }
});

// DELETE /api/themes/:id - Delete theme
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.run('DELETE FROM themes WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Theme deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete theme'
    });
  }
});

// POST /api/themes/background/upload - Upload background image/video
router.post('/background/upload', async (req, res) => {
  try {
    // This would integrate with your existing media upload system
    // For now, return a placeholder response
    res.json({
      success: true,
      data: {
        url: '/uploads/backgrounds/placeholder.jpg'
      }
    });
  } catch (error) {
    console.error('Error uploading background:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload background'
    });
  }
});

export default router;
