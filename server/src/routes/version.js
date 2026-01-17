import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * Version checking endpoint
 */

const APP_VERSION = '1.0.0'; // Update this when releasing new versions

// GET /api/version - Get current app version
router.get('/', async (req, res) => {
  try {
    // Read version from package.json
    const packagePath = path.join(__dirname, '../../../package.json');
    const packageData = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(packageData);

    res.json({
      success: true,
      version: packageJson.version || APP_VERSION,
      releaseDate: packageJson.releaseDate || new Date().toISOString(),
      changelog: packageJson.changelog || []
    });
  } catch (error) {
    console.error('Error reading version:', error);
    res.json({
      success: true,
      version: APP_VERSION,
      releaseDate: new Date().toISOString(),
      changelog: []
    });
  }
});

export default router;
