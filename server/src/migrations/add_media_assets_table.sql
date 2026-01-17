-- Create media_assets table for asset library
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  file_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'document'
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- in bytes
  width INTEGER, -- for images/videos
  height INTEGER, -- for images/videos
  duration REAL, -- for videos/audio in seconds
  tags TEXT, -- JSON array of tags
  description TEXT,
  uploaded_by TEXT,
  uploaded_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_optimized INTEGER DEFAULT 0,
  metadata TEXT -- JSON object for additional metadata
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(file_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded ON media_assets(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploader ON media_assets(uploaded_by);

-- Create module_versions table for version control
CREATE TABLE IF NOT EXISTS module_versions (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- JSON snapshot of module data
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  change_summary TEXT,
  is_published INTEGER DEFAULT 0,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Create indexes for version control
CREATE INDEX IF NOT EXISTS idx_module_versions_module ON module_versions(module_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_module_versions_created ON module_versions(created_at DESC);
