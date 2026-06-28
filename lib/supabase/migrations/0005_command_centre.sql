-- Admin tasks (Nick's to-do list)
CREATE TABLE IF NOT EXISTS admin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  position BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON admin_tasks USING (false);

-- Content calendar
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  platform TEXT NOT NULL DEFAULT 'Instagram',
  title TEXT NOT NULL,
  hook TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON content_calendar USING (false);

-- Coach notes (ideas and insights from Edge)
CREATE TABLE IF NOT EXISTS coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON coach_notes USING (false);
