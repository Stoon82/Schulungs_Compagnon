-- The Compagnon Database Schema
-- SQLite Database for Training System

-- Participants and Sessions
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  nickname TEXT,
  session_token TEXT UNIQUE NOT NULL,
  avatar_seed TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_participants_token ON participants(session_token);
CREATE INDEX idx_participants_last_seen ON participants(last_seen);

-- Module Progress Tracking
CREATE TABLE IF NOT EXISTS progress (
  participant_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed BOOLEAN DEFAULT 0,
  completed_at DATETIME,
  PRIMARY KEY (participant_id, module_id),
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX idx_progress_participant ON progress(participant_id);
CREATE INDEX idx_progress_module ON progress(module_id);

-- Mood Tracking for Analytics
CREATE TABLE IF NOT EXISTS moods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id TEXT NOT NULL,
  mood TEXT NOT NULL CHECK(mood IN ('confused', 'thinking', 'aha', 'wow')),
  module_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX idx_moods_participant ON moods(participant_id);
CREATE INDEX idx_moods_timestamp ON moods(timestamp);
CREATE INDEX idx_moods_module ON moods(module_id);

-- Sandbox Apps Created by Participants
CREATE TABLE IF NOT EXISTS sandbox_apps (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  is_featured BOOLEAN DEFAULT 0,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX idx_sandbox_participant ON sandbox_apps(participant_id);
CREATE INDEX idx_sandbox_active ON sandbox_apps(is_active);
CREATE INDEX idx_sandbox_created ON sandbox_apps(created_at);

-- Voting System for Apps
CREATE TABLE IF NOT EXISTS votes (
  app_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'down')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (app_id, participant_id),
  FOREIGN KEY (app_id) REFERENCES sandbox_apps(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX idx_votes_app ON votes(app_id);
CREATE INDEX idx_votes_participant ON votes(participant_id);

-- Secret Codes for Easter Eggs
CREATE TABLE IF NOT EXISTS secret_codes (
  code TEXT PRIMARY KEY,
  feature_id TEXT NOT NULL,
  description TEXT,
  expires_at DATETIME,
  created_by TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0
);

CREATE INDEX idx_codes_expires ON secret_codes(expires_at);
CREATE INDEX idx_codes_feature ON secret_codes(feature_id);

-- Code Redemptions Tracking
CREATE TABLE IF NOT EXISTS code_redemptions (
  participant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (participant_id, code),
  FOREIGN KEY (code) REFERENCES secret_codes(code) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX idx_redemptions_participant ON code_redemptions(participant_id);
CREATE INDEX idx_redemptions_code ON code_redemptions(code);

-- Chat History (Optional - for analytics)
CREATE TABLE IF NOT EXISTS chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  module_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  response_time_ms INTEGER,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_participant ON chat_history(participant_id);
CREATE INDEX idx_chat_timestamp ON chat_history(timestamp);

-- System Events Log
CREATE TABLE IF NOT EXISTS system_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT,
  triggered_by TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_type ON system_events(event_type);
CREATE INDEX idx_events_timestamp ON system_events(timestamp);

-- Admin Actions Log
CREATE TABLE IF NOT EXISTS admin_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  data TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  participant_id TEXT,
  admin_id TEXT,
  data TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success INTEGER DEFAULT 1,
  error_message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);

CREATE INDEX idx_admin_actions_type ON admin_actions(action);
CREATE INDEX idx_admin_actions_timestamp ON admin_actions(timestamp);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
