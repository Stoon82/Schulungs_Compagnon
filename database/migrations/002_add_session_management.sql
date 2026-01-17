-- Migration 002: Session Management System
-- Adds classes, sessions, authentication, and role-based access

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  display_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
);

-- Classes (training sessions that can be prepared in advance)
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  module_id TEXT,
  start_date DATETIME,
  end_date DATETIME,
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL
);

-- Class sharing (which admins can access which classes)
CREATE TABLE IF NOT EXISTS class_shares (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  shared_with_admin_id TEXT NOT NULL,
  permission_level TEXT DEFAULT 'view', -- 'view', 'edit', 'admin'
  shared_by TEXT NOT NULL,
  shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES admin_users(id) ON DELETE CASCADE,
  UNIQUE(class_id, shared_with_admin_id)
);

-- Live sessions (active training sessions)
CREATE TABLE IF NOT EXISTS live_sessions (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  session_code TEXT UNIQUE NOT NULL, -- 6-digit code for clients to join
  started_by TEXT NOT NULL,
  current_submodule_id TEXT,
  current_submodule_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'ended'
  presentation_mode TEXT DEFAULT 'manual', -- 'manual', 'auto', 'self-paced', 'hybrid'
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (started_by) REFERENCES admin_users(id) ON DELETE CASCADE,
  FOREIGN KEY (current_submodule_id) REFERENCES submodules(id) ON DELETE SET NULL
);

-- Session participants (clients who joined a session)
CREATE TABLE IF NOT EXISTS session_participants (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  role TEXT DEFAULT 'participant', -- 'participant', 'moderator', 'co-moderator', 'co-admin'
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_online BOOLEAN DEFAULT 1,
  FOREIGN KEY (session_id) REFERENCES live_sessions(id) ON DELETE CASCADE
);

-- Session activity log
CREATE TABLE IF NOT EXISTS session_activity (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  participant_id TEXT,
  activity_type TEXT NOT NULL, -- 'join', 'leave', 'navigate', 'interaction', 'role_change'
  activity_data TEXT, -- JSON data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES live_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES session_participants(id) ON DELETE SET NULL
);

-- Update existing sessions table to link to live_sessions
-- (The old sessions table will be deprecated in favor of live_sessions)

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_classes_created_by ON classes(created_by);
CREATE INDEX IF NOT EXISTS idx_classes_module_id ON classes(module_id);
CREATE INDEX IF NOT EXISTS idx_class_shares_class_id ON class_shares(class_id);
CREATE INDEX IF NOT EXISTS idx_class_shares_admin_id ON class_shares(shared_with_admin_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_class_id ON live_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_code ON live_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_activity_session_id ON session_activity(session_id);
