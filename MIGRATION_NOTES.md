# Database Migration Notes

## Add Class Modules Support

To enable multiple modules per class with locking functionality, run the following SQL:

```sql
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_class_modules_class_id ON class_modules(class_id);
CREATE INDEX IF NOT EXISTS idx_class_modules_module_id ON class_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_class_modules_order ON class_modules(class_id, order_index);
```

## How to Run

Open the database with a SQLite client and execute the SQL above, or use:
```bash
sqlite3 database/compagnon.db < server/src/migrations/add_class_modules.sql
```

## Features Added

1. **Multiple Modules per Class**: Classes can now contain multiple modules
2. **Module Locking**: Modules can be locked/unlocked for clients
3. **Drag-and-Drop Reordering**: Modules can be reordered within a class
4. **Multi-Question Quizzes**: Quizzes support multiple questions
5. **Multiple Correct Answers**: Quiz questions can have multiple correct answers
6. **Multi-Question Polls**: Polls support multiple questions
