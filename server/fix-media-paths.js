// Fix media asset paths to include optimized/ subfolder
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./compagnon.db');
const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));

async function fixMediaPaths() {
  try {
    console.log('Checking for media_assets table...');
    
    // Get all optimized images with incorrect paths
    const assets = await dbAll(`
      SELECT id, file_path, is_optimized 
      FROM media_assets 
      WHERE is_optimized = 1 
      AND file_path LIKE '/uploads/media/opt_%'
      AND file_path NOT LIKE '/uploads/media/optimized/%'
    `);
    
    console.log(`Found ${assets.length} assets with incorrect paths`);
    
    for (const asset of assets) {
      const filename = asset.file_path.split('/').pop();
      const newPath = `/uploads/media/optimized/${filename}`;
      
      console.log(`Updating: ${asset.file_path} -> ${newPath}`);
      
      await dbRun(
        'UPDATE media_assets SET file_path = ? WHERE id = ?',
        [newPath, asset.id]
      );
    }
    
    console.log('✅ All paths updated successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    db.close();
  }
}

fixMediaPaths();
