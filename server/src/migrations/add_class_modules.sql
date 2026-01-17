-- Migration: Add support for multiple modules per class with locking

-- Create class_modules junction table
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
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_class_modules_class_id ON class_modules(class_id);
CREATE INDEX IF NOT EXISTS idx_class_modules_module_id ON class_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_class_modules_order ON class_modules(class_id, order_index);

-- Add multiple correct answers support to quiz_questions
-- Store correct_answer as JSON array instead of single value
-- This is already JSON in the schema, so we're good

-- Note: Run this migration with: sqlite3 database/compagnon.db < server/src/migrations/add_class_modules.sql
