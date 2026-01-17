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
      // Drop existing media_assets table if it has old schema
      try {
        await this.run('DROP TABLE IF EXISTS media_assets');
        await this.run('DROP INDEX IF EXISTS idx_media_assets_type');
        await this.run('DROP INDEX IF EXISTS idx_media_assets_uploaded');
        await this.run('DROP INDEX IF EXISTS idx_media_assets_uploader');
        console.log('✅ Dropped old media_assets table');
      } catch (err) {
        console.log('No existing media_assets table to drop');
      }

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
