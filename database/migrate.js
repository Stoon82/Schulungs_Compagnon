import sqlite3 from 'sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'compagnon.db');
const MIGRATIONS_DIR = join(__dirname, 'migrations');

function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message);
      process.exit(1);
    }
  });

  db.serialize(() => {
    // Create migrations tracking table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating migrations table:', err.message);
        process.exit(1);
      }
    });

    // Get list of already applied migrations
    db.all('SELECT filename FROM migrations', (err, appliedMigrations) => {
      if (err) {
        console.error('❌ Error reading migrations:', err.message);
        process.exit(1);
      }

      const appliedSet = new Set(appliedMigrations.map(m => m.filename));
      
      // Get all migration files
      const migrationFiles = readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      let appliedCount = 0;
      let processedCount = 0;

      if (migrationFiles.length === 0) {
        console.log('✨ No migration files found!');
        db.close();
        return;
      }

      migrationFiles.forEach((filename, index) => {
        if (appliedSet.has(filename)) {
          console.log(`⏭️  Skipping ${filename} (already applied)`);
          processedCount++;
          
          if (processedCount === migrationFiles.length) {
            finalizeMigrations();
          }
          return;
        }

        console.log(`📝 Applying ${filename}...`);
        
        const migrationPath = join(MIGRATIONS_DIR, filename);
        const sql = readFileSync(migrationPath, 'utf8');

        db.exec(sql, (err) => {
          if (err) {
            console.error(`❌ Error applying ${filename}:`, err.message);
            process.exit(1);
          }

          db.run('INSERT INTO migrations (filename) VALUES (?)', [filename], (err) => {
            if (err) {
              console.error(`❌ Error recording migration ${filename}:`, err.message);
              process.exit(1);
            }

            console.log(`✅ Applied ${filename}`);
            appliedCount++;
            processedCount++;

            if (processedCount === migrationFiles.length) {
              finalizeMigrations();
            }
          });
        });
      });

      function finalizeMigrations() {
        db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err.message);
            process.exit(1);
          }

          if (appliedCount === 0) {
            console.log('✨ Database is up to date!');
          } else {
            console.log(`✨ Successfully applied ${appliedCount} migration(s)!`);
          }
        });
      }
    });
  });
}

runMigrations();

export { runMigrations };
