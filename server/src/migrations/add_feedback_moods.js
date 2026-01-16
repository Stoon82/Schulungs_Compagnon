import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../../database/compagnon.db');

console.log('🔧 Running migration: Add pause_request and overwhelmed moods...');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
});

// SQLite doesn't support ALTER TABLE to modify CHECK constraints
// We need to recreate the table with the new constraint
db.serialize(() => {
  // Step 1: Create new table with updated constraint
  db.run(`
    CREATE TABLE moods_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL,
      mood TEXT NOT NULL CHECK(mood IN ('confused', 'thinking', 'aha', 'wow', 'pause_request', 'overwhelmed')),
      module_id INTEGER,
      timestamp DATETIME NOT NULL,
      FOREIGN KEY (participant_id) REFERENCES participants(id),
      FOREIGN KEY (module_id) REFERENCES modules(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating new moods table:', err);
      db.close();
      process.exit(1);
    }
    console.log('✅ Created new moods table with updated constraint');
  });

  // Step 2: Copy data from old table to new table
  db.run(`
    INSERT INTO moods_new (id, participant_id, mood, module_id, timestamp)
    SELECT id, participant_id, mood, module_id, timestamp
    FROM moods
  `, (err) => {
    if (err) {
      console.error('❌ Error copying data:', err);
      db.close();
      process.exit(1);
    }
    console.log('✅ Copied existing mood data');
  });

  // Step 3: Drop old table
  db.run(`DROP TABLE moods`, (err) => {
    if (err) {
      console.error('❌ Error dropping old table:', err);
      db.close();
      process.exit(1);
    }
    console.log('✅ Dropped old moods table');
  });

  // Step 4: Rename new table to original name
  db.run(`ALTER TABLE moods_new RENAME TO moods`, (err) => {
    if (err) {
      console.error('❌ Error renaming table:', err);
      db.close();
      process.exit(1);
    }
    console.log('✅ Renamed new table to moods');
    console.log('🎉 Migration completed successfully!');
    
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err);
        process.exit(1);
      }
      process.exit(0);
    });
  });
});
