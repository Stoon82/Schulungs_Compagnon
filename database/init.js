import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'compagnon.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

console.log('🗄️  Initializing Compagnon Database...');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

const schema = readFileSync(SCHEMA_PATH, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Error executing schema:', err.message);
    process.exit(1);
  }
  console.log('✅ Database schema created successfully');
  
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
      process.exit(1);
    }
    console.log('✅ Database initialization complete!');
    console.log(`📍 Database location: ${DB_PATH}`);
  });
});
