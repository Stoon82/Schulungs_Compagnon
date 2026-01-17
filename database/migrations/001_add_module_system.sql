-- Migration: Add Module System Tables
-- Created: 2026-01-17
-- Description: Extends database schema for modular schooling system

-- Modules Table
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER,
  prerequisites TEXT,
  learning_objectives TEXT,
  theme_override TEXT,
  author TEXT,
  version TEXT DEFAULT '1.0',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_published BOOLEAN DEFAULT 0,
  order_index INTEGER
);

CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_modules_published ON modules(is_published);
CREATE INDEX idx_modules_order ON modules(order_index);

-- Submodules Table
CREATE TABLE IF NOT EXISTS submodules (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  template_type TEXT NOT NULL,
  content TEXT,
  styling TEXT,
  duration_estimate INTEGER,
  notes TEXT,
  order_index INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX idx_submodules_module ON submodules(module_id);
CREATE INDEX idx_submodules_order ON submodules(order_index);
CREATE INDEX idx_submodules_template ON submodules(template_type);

-- Media Assets Table
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT,
  mime_type TEXT,
  size INTEGER,
  storage_type TEXT CHECK(storage_type IN ('local', 'git-lfs', 's3')),
  storage_path TEXT,
  thumbnail_path TEXT,
  tags TEXT,
  uploaded_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_type ON media_assets(mime_type);
CREATE INDEX idx_media_storage ON media_assets(storage_type);
CREATE INDEX idx_media_uploaded ON media_assets(uploaded_by);

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id TEXT PRIMARY KEY,
  submodule_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK(question_type IN ('multiple_choice', 'true_false', 'short_answer', 'rating_scale', 'drag_drop')),
  options TEXT,
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  order_index INTEGER,
  FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_submodule ON quiz_questions(submodule_id);
CREATE INDEX idx_quiz_type ON quiz_questions(question_type);

-- Quiz Responses Table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT,
  is_correct BOOLEAN,
  time_taken INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_responses_session ON quiz_responses(session_id);
CREATE INDEX idx_quiz_responses_user ON quiz_responses(user_id);
CREATE INDEX idx_quiz_responses_question ON quiz_responses(question_id);

-- Poll Results Table
CREATE TABLE IF NOT EXISTS poll_results (
  id TEXT PRIMARY KEY,
  submodule_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  option_selected TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE
);

CREATE INDEX idx_poll_submodule ON poll_results(submodule_id);
CREATE INDEX idx_poll_session ON poll_results(session_id);
CREATE INDEX idx_poll_user ON poll_results(user_id);

-- Word Cloud Entries Table
CREATE TABLE IF NOT EXISTS wordcloud_entries (
  id TEXT PRIMARY KEY,
  submodule_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE
);

CREATE INDEX idx_wordcloud_submodule ON wordcloud_entries(submodule_id);
CREATE INDEX idx_wordcloud_session ON wordcloud_entries(session_id);
CREATE INDEX idx_wordcloud_word ON wordcloud_entries(word);

-- User Progress Table (Extended)
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  submodule_id TEXT,
  status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed')),
  score INTEGER,
  time_spent INTEGER,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_module ON user_progress(module_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);

-- User Notes Table
CREATE TABLE IF NOT EXISTS user_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  submodule_id TEXT NOT NULL,
  note_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_notes_user ON user_notes(user_id);
CREATE INDEX idx_user_notes_submodule ON user_notes(submodule_id);

-- User Bookmarks Table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  submodule_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_submodule ON user_bookmarks(submodule_id);

-- Sessions Table (Extended)
CREATE TABLE IF NOT EXISTS training_sessions (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  current_submodule_id TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  participants_count INTEGER DEFAULT 0,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_module ON training_sessions(module_id);
CREATE INDEX idx_sessions_started ON training_sessions(started_at);

-- App Gallery Items Table
CREATE TABLE IF NOT EXISTS app_gallery_items (
  id TEXT PRIMARY KEY,
  submodule_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  description TEXT,
  screenshot_url TEXT,
  prompt_used TEXT,
  app_url TEXT,
  order_index INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE
);

CREATE INDEX idx_app_gallery_submodule ON app_gallery_items(submodule_id);
CREATE INDEX idx_app_gallery_order ON app_gallery_items(order_index);

-- App Feedback Table
CREATE TABLE IF NOT EXISTS app_feedback (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  feedback_type TEXT CHECK(feedback_type IN ('up', 'down', 'neutral')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES app_gallery_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_app_feedback_app ON app_feedback(app_id);
CREATE INDEX idx_app_feedback_session ON app_feedback(session_id);
CREATE INDEX idx_app_feedback_type ON app_feedback(feedback_type);
