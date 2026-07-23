-- 0006 — Walk logging + free up training_sessions.session_type
--
-- 1) Barry's Block 2 uses session keys "session-a" / "session-b", but the
--    original CHECK constraint only allowed push/squat/pull, so completing a
--    weights session was silently rejected and his exercise weights never
--    saved. Drop the constraint so any programme's session keys can be logged.
ALTER TABLE training_sessions
  DROP CONSTRAINT IF EXISTS training_sessions_session_type_check;

-- 2) Walk logging — one row per logged walk (a client can walk more than once
--    a day, so no unique constraint; we sum per day).
CREATE TABLE IF NOT EXISTS walk_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  minutes INTEGER NOT NULL CHECK (minutes > 0 AND minutes <= 600),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS walk_logs_user_date_idx ON walk_logs (user_id, date);

ALTER TABLE walk_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "walk_logs own select" ON walk_logs;
CREATE POLICY "walk_logs own select" ON walk_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "walk_logs own insert" ON walk_logs;
CREATE POLICY "walk_logs own insert" ON walk_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "walk_logs own delete" ON walk_logs;
CREATE POLICY "walk_logs own delete" ON walk_logs
  FOR DELETE USING (auth.uid() = user_id);
