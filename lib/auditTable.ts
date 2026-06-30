// Idempotent DDL for the audit store. Used by the audit POST route (self-heal on
// first submission) and the admin audit inbox (ensure-exists on load), so nobody
// ever has to run SQL by hand.
export const AUDIT_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS audit_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_submissions' AND policyname = 'Service role only'
  ) THEN
    ALTER TABLE audit_submissions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role only" ON audit_submissions USING (false);
  END IF;
END $$;
`;
