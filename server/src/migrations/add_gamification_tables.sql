-- Migration: Add Gamification Tables
-- Description: Tables for points, leaderboard, badges, achievements, and streaks
-- Created: 2026-01-17

-- User Points Table
CREATE TABLE IF NOT EXISTS user_points (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'quiz', 'poll', 'wordcloud', 'participation', 'completion'
  activity_id TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_session_id ON user_points(session_id);
CREATE INDEX IF NOT EXISTS idx_user_points_earned_at ON user_points(earned_at);

-- User Total Points (Aggregated)
CREATE TABLE IF NOT EXISTS user_total_points (
  user_id TEXT PRIMARY KEY,
  total_points INTEGER NOT NULL DEFAULT 0,
  session_points INTEGER NOT NULL DEFAULT 0,
  quiz_points INTEGER NOT NULL DEFAULT 0,
  interaction_points INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges/Achievements Definitions
CREATE TABLE IF NOT EXISTS badge_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Icon name or emoji
  criteria TEXT NOT NULL, -- JSON with criteria
  points_required INTEGER,
  category TEXT, -- 'quiz', 'participation', 'completion', 'streak', 'special'
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Badges (Earned)
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 100, -- Percentage of completion
  FOREIGN KEY (badge_id) REFERENCES badge_definitions(id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);

-- User Streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard Cache (for performance)
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  session_id TEXT,
  module_id TEXT,
  cache_type TEXT NOT NULL, -- 'global', 'session', 'module'
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_type ON leaderboard_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_session ON leaderboard_cache(session_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_module ON leaderboard_cache(module_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_rank ON leaderboard_cache(rank);

-- Insert default badge definitions
INSERT OR IGNORE INTO badge_definitions (id, name, description, icon, criteria, points_required, category, rarity) VALUES
  ('first_quiz', 'Quiz Neuling', 'Erstes Quiz abgeschlossen', '🎯', '{"type": "quiz_count", "count": 1}', 10, 'quiz', 'common'),
  ('quiz_master', 'Quiz Meister', '10 Quizze abgeschlossen', '🏆', '{"type": "quiz_count", "count": 10}', 100, 'quiz', 'rare'),
  ('perfect_score', 'Perfekt!', '100% in einem Quiz erreicht', '⭐', '{"type": "quiz_score", "score": 100}', 50, 'quiz', 'epic'),
  ('active_participant', 'Aktiver Teilnehmer', '50 Interaktionen', '💬', '{"type": "interaction_count", "count": 50}', 75, 'participation', 'rare'),
  ('poll_voter', 'Meinungsbildner', '10 Umfragen teilgenommen', '📊', '{"type": "poll_count", "count": 10}', 30, 'participation', 'common'),
  ('wordcloud_contributor', 'Wortschmied', '20 Word Cloud Beiträge', '☁️', '{"type": "wordcloud_count", "count": 20}', 40, 'participation', 'common'),
  ('module_complete', 'Modul Abgeschlossen', 'Erstes Modul vollständig abgeschlossen', '✅', '{"type": "module_completion", "count": 1}', 100, 'completion', 'rare'),
  ('speed_learner', 'Schnelllerner', 'Modul in unter 30 Minuten abgeschlossen', '⚡', '{"type": "completion_time", "max_minutes": 30}', 75, 'completion', 'epic'),
  ('week_streak', 'Wochensträhne', '7 Tage in Folge aktiv', '🔥', '{"type": "streak", "days": 7}', 150, 'streak', 'epic'),
  ('month_streak', 'Monatssträhne', '30 Tage in Folge aktiv', '🔥🔥', '{"type": "streak", "days": 30}', 500, 'streak', 'legendary'),
  ('early_bird', 'Frühaufsteher', 'Vor 8 Uhr morgens aktiv', '🌅', '{"type": "time_of_day", "before": 8}', 25, 'special', 'common'),
  ('night_owl', 'Nachteule', 'Nach 22 Uhr aktiv', '🦉', '{"type": "time_of_day", "after": 22}', 25, 'special', 'common');
