-- Create analytics tables for tracking session metrics and user interactions

-- Session analytics table
CREATE TABLE IF NOT EXISTS session_analytics (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  class_id TEXT,
  module_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  total_participants INTEGER DEFAULT 0,
  unique_participants INTEGER DEFAULT 0,
  total_duration INTEGER, -- in seconds
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Submodule view tracking
CREATE TABLE IF NOT EXISTS submodule_views (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  submodule_id TEXT NOT NULL,
  user_id TEXT,
  viewed_at TEXT NOT NULL,
  time_spent INTEGER, -- in seconds
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE
);

-- Quiz analytics table
CREATE TABLE IF NOT EXISTS quiz_analytics (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  submodule_id TEXT NOT NULL,
  user_id TEXT,
  score REAL NOT NULL,
  max_score REAL NOT NULL,
  time_to_complete INTEGER, -- in seconds
  answers TEXT, -- JSON array of answers
  submitted_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE
);

-- Interaction tracking (reactions, polls, word clouds, Q&A)
CREATE TABLE IF NOT EXISTS interaction_analytics (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  submodule_id TEXT NOT NULL,
  user_id TEXT,
  interaction_type TEXT NOT NULL, -- 'emoji', 'poll', 'wordcloud', 'qa', 'feedback'
  interaction_data TEXT, -- JSON data
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE
);

-- Participant progress tracking
CREATE TABLE IF NOT EXISTS participant_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  submodules_completed TEXT, -- JSON array of submodule IDs
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  quiz_scores TEXT, -- JSON object with submodule_id: score
  bookmarks TEXT, -- JSON array of submodule IDs
  notes_count INTEGER DEFAULT 0,
  last_accessed TEXT,
  completion_percentage REAL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  module_id TEXT NOT NULL,
  module_title TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  verification_code TEXT UNIQUE NOT NULL,
  certificate_data TEXT, -- JSON with customization options
  pdf_path TEXT,
  created_at TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_analytics_session ON session_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_session_analytics_class ON session_analytics(class_id);
CREATE INDEX IF NOT EXISTS idx_submodule_views_session ON submodule_views(session_id);
CREATE INDEX IF NOT EXISTS idx_submodule_views_submodule ON submodule_views(submodule_id);
CREATE INDEX IF NOT EXISTS idx_submodule_views_user ON submodule_views(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_analytics_session ON quiz_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_analytics_submodule ON quiz_analytics(submodule_id);
CREATE INDEX IF NOT EXISTS idx_interaction_analytics_session ON interaction_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_interaction_analytics_type ON interaction_analytics(interaction_type);
CREATE INDEX IF NOT EXISTS idx_participant_progress_user ON participant_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_participant_progress_module ON participant_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification ON certificates(verification_code);
