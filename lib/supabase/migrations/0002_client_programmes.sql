-- Migration 0002 — Per-client programmes
-- Each client gets their own bespoke training/nutrition programme document.
-- The shared app template renders from this; absence = "awaiting programme" state.
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS client_programmes (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  programme  JSONB NOT NULL,
  sessions   JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_programmes ENABLE ROW LEVEL SECURITY;

-- Client can read only their own programme. Writes are service-role only
-- (Nick authors via the admin/service key), matching the admin_notes pattern.
DROP POLICY IF EXISTS "Users can read own programme" ON client_programmes;
CREATE POLICY "Users can read own programme"
  ON client_programmes FOR SELECT
  USING (auth.uid() = user_id);

-- Keep updated_at fresh (reuses the existing update_updated_at() function).
DROP TRIGGER IF EXISTS client_programmes_updated_at ON client_programmes;
CREATE TRIGGER client_programmes_updated_at
  BEFORE UPDATE ON client_programmes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
