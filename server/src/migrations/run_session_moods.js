import db from '../services/database.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    const sql = fs.readFileSync(join(__dirname, 'add_session_moods.sql'), 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.run(statement);
      }
    }
    
    console.log('✅ Migration completed: session_moods table created');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
