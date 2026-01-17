import db from '../services/database.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');

    // Create class_modules table
    await db.run(`
      CREATE TABLE IF NOT EXISTS class_modules (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_locked INTEGER NOT NULL DEFAULT 1,
        unlocked_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
        UNIQUE(class_id, module_id)
      )
    `);

    console.log('✅ class_modules table created');

    // Create indexes
    await db.run(`CREATE INDEX IF NOT EXISTS idx_class_modules_class_id ON class_modules(class_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_class_modules_module_id ON class_modules(module_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_class_modules_order ON class_modules(class_id, order_index)`);

    console.log('✅ Indexes created');
    console.log('✅ Migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
