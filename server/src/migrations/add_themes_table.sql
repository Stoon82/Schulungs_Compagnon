-- Create themes table for storing theme configurations
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  theme_data TEXT NOT NULL, -- JSON string containing theme configuration
  is_global INTEGER DEFAULT 0, -- 1 if this is a global theme, 0 for class/module specific
  entity_type TEXT, -- 'class', 'module', 'submodule' or NULL for global
  entity_id TEXT, -- ID of the class/module/submodule this theme applies to
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_themes_global ON themes(is_global);
CREATE INDEX IF NOT EXISTS idx_themes_entity ON themes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_themes_updated ON themes(updated_at DESC);
