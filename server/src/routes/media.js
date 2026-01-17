import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import db from '../services/database.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/media');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    console.log('Upload attempt - mimetype:', file.mimetype, 'filename:', file.originalname);
    
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/m4a',
      'application/pdf'
    ];

    // Check by MIME type first
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    // Fallback: check by file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
      '.mp4', '.webm', '.mov', '.m4v',
      '.mp3', '.wav', '.ogg', '.m4a',
      '.pdf'
    ];

    if (allowedExtensions.includes(ext)) {
      console.log('Accepted by extension:', ext);
      cb(null, true);
    } else {
      console.log('Rejected - unsupported type');
      cb(new Error(`Unsupported file type: ${file.mimetype} (${ext})`));
    }
  }
});

/**
 * POST /api/media/upload - Upload and optimize media files
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const { description = '', tags = '[]' } = req.body;
    const assetId = uuidv4();
    
    let fileType = 'document';
    if (file.mimetype.startsWith('image/')) fileType = 'image';
    else if (file.mimetype.startsWith('video/')) fileType = 'video';
    else if (file.mimetype.startsWith('audio/')) fileType = 'audio';

    let width = null;
    let height = null;
    let thumbnailPath = null;
    let optimizedPath = file.path;

    // Process images with Sharp
    if (fileType === 'image' && file.mimetype !== 'image/svg+xml') {
      try {
        const image = sharp(file.path);
        const metadata = await image.metadata();
        
        width = metadata.width;
        height = metadata.height;

        // Generate thumbnail (300x300)
        const thumbnailDir = path.join(__dirname, '../../../uploads/media/thumbnails');
        await fs.mkdir(thumbnailDir, { recursive: true });
        
        const thumbnailFilename = `thumb_${path.basename(file.filename)}`;
        thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
        
        await image
          .resize(300, 300, { fit: 'cover' })
          .toFile(thumbnailPath);

        // Optimize and compress image
        const optimizedDir = path.join(__dirname, '../../../uploads/media/optimized');
        await fs.mkdir(optimizedDir, { recursive: true });
        
        const optimizedFilename = `opt_${path.basename(file.filename, path.extname(file.filename))}.webp`;
        optimizedPath = path.join(optimizedDir, optimizedFilename);

        // Resize if too large (max 1920px width)
        let resizeOptions = {};
        if (width > 1920) {
          resizeOptions = { width: 1920, withoutEnlargement: true };
        }

        await image
          .resize(resizeOptions)
          .webp({ quality: 85 })
          .toFile(optimizedPath);

        // Check if optimized file is smaller
        const originalStats = await fs.stat(file.path);
        const optimizedStats = await fs.stat(optimizedPath);

        if (optimizedStats.size >= originalStats.size) {
          // Keep original if optimization didn't help
          await fs.unlink(optimizedPath);
          optimizedPath = file.path;
        } else {
          // Delete original, use optimized
          await fs.unlink(file.path);
        }

      } catch (error) {
        console.error('Image processing error:', error);
        // Continue with original file if processing fails
      }
    }

    // Get final file stats
    const stats = await fs.stat(optimizedPath);

    // Store in database
    // Determine correct file path based on whether file was optimized
    const isOptimized = optimizedPath !== file.path;
    const filePath = isOptimized 
      ? `/uploads/media/optimized/${path.basename(optimizedPath)}`
      : `/uploads/media/${path.basename(optimizedPath)}`;
    
    await db.run(
      `INSERT INTO media_assets (
        id, filename, original_filename, file_path, thumbnail_path,
        file_type, mime_type, file_size, width, height,
        tags, description, uploaded_by, uploaded_at, updated_at, is_optimized
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assetId,
        path.basename(optimizedPath),
        file.originalname,
        filePath,
        thumbnailPath ? `/uploads/media/thumbnails/${path.basename(thumbnailPath)}` : null,
        fileType,
        file.mimetype,
        stats.size,
        width,
        height,
        tags,
        description,
        req.user?.id || 'admin',
        new Date().toISOString(),
        new Date().toISOString(),
        isOptimized ? 1 : 0
      ]
    );

    res.json({
      success: true,
      data: {
        id: assetId,
        filename: path.basename(optimizedPath),
        original_filename: file.originalname,
        file_path: filePath,
        thumbnail_path: thumbnailPath ? `/uploads/media/thumbnails/${path.basename(thumbnailPath)}` : null,
        file_type: fileType,
        file_size: stats.size,
        width,
        height
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
});

/**
 * GET /api/media/assets - Get all media assets
 */
router.get('/assets', async (req, res) => {
  try {
    const { type, search, tags, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM media_assets WHERE 1=1';
    const params = [];

    if (type && type !== 'all') {
      query += ' AND file_type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (original_filename LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tags) {
      query += ' AND tags LIKE ?';
      params.push(`%${tags}%`);
    }

    query += ' ORDER BY uploaded_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const assets = await db.all(query, params);

    res.json({
      success: true,
      data: assets
    });

  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assets'
    });
  }
});

/**
 * GET /api/media/assets/:id - Get specific asset
 */
router.get('/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await db.get('SELECT * FROM media_assets WHERE id = ?', [id]);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: asset
    });

  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset'
    });
  }
});

/**
 * DELETE /api/media/assets/:id - Delete asset
 */
router.delete('/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await db.get('SELECT * FROM media_assets WHERE id = ?', [id]);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    // Delete files
    const filePath = path.join(__dirname, '../../../', asset.file_path);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    if (asset.thumbnail_path) {
      const thumbnailPath = path.join(__dirname, '../../../', asset.thumbnail_path);
      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        console.error('Error deleting thumbnail:', error);
      }
    }

    // Delete from database
    await db.run('DELETE FROM media_assets WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete asset'
    });
  }
});

/**
 * PUT /api/media/assets/:id - Update asset metadata
 */
router.put('/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, tags } = req.body;

    await db.run(
      'UPDATE media_assets SET description = ?, tags = ?, updated_at = ? WHERE id = ?',
      [description, JSON.stringify(tags), new Date().toISOString(), id]
    );

    res.json({
      success: true,
      message: 'Asset updated successfully'
    });

  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update asset'
    });
  }
});

export default router;
