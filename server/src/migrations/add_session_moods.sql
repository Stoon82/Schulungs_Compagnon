-- Migration: Add session_moods table for live session feedback
CREATE TABLE IF NOT EXISTS session_moods (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    mood TEXT NOT NULL,
    module_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES live_sessions(id),
    FOREIGN KEY (participant_id) REFERENCES session_participants(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_session_moods_session ON session_moods(session_id);
CREATE INDEX IF NOT EXISTS idx_session_moods_participant ON session_moods(participant_id);
CREATE INDEX IF NOT EXISTS idx_session_moods_timestamp ON session_moods(timestamp);
