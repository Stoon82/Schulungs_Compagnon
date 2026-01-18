import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../../database/compagnon.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('✅ Database connected');
        await this.runMigrations();
      }
    });
  }

  async runMigrations() {
    try {
      // Create media_assets table if it doesn't exist (don't drop!)
      const migrationPath = join(__dirname, '../migrations/add_media_assets_table.sql');
      const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
      
      // Split by semicolon and run each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        await this.run(statement);
      }
      
      // Add theme_override column to classes table if it doesn't exist
      try {
        await this.run('ALTER TABLE classes ADD COLUMN theme_override TEXT');
        console.log('✅ Added theme_override column to classes');
      } catch (err) {
        // Column already exists, ignore error
      }
      
      // Create session_moods table for live feedback
      await this.run(`
        CREATE TABLE IF NOT EXISTS session_moods (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          participant_id TEXT NOT NULL,
          mood TEXT NOT NULL,
          module_id TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES live_sessions(id),
          FOREIGN KEY (participant_id) REFERENCES session_participants(id)
        )
      `);
      await this.run('CREATE INDEX IF NOT EXISTS idx_session_moods_session ON session_moods(session_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_session_moods_participant ON session_moods(participant_id)');
      
      // Create wordcloud_words table for collaborative word cloud
      await this.run(`
        CREATE TABLE IF NOT EXISTS wordcloud_words (
          id TEXT PRIMARY KEY,
          session_code TEXT NOT NULL,
          submodule_id TEXT NOT NULL,
          word TEXT NOT NULL,
          participant_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await this.run('CREATE INDEX IF NOT EXISTS idx_wordcloud_session ON wordcloud_words(session_code, submodule_id)');
      
      console.log('✅ Database migrations completed');
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default new Database();
