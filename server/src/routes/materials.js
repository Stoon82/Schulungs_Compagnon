import express from 'express';
import materialService from '../services/materialService.js';
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

router.get('/', authenticate, async (req, res) => {
  try {
    const materials = await materialService.getAllMaterials();

    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch materials'
    });
  }
});

router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = materialService.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

router.get('/:materialId', authenticate, async (req, res) => {
  try {
    const { materialId } = req.params;
    const material = await materialService.getMaterialById(materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    await materialService.trackMaterialAccess(req.participant.id, materialId);

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch material'
    });
  }
});

router.get('/:materialId/summary', authenticate, async (req, res) => {
  try {
    const { materialId } = req.params;
    const summary = await materialService.generateMaterialSummary(materialId);

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary'
    });
  }
});

export default router;
