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

NOTIFY pgrst, 'reload schema';
`;

// Supabase/PostgREST reports a missing table in a few different shapes depending
// on whether Postgres or the REST schema cache is the one that can't find it.
export function isMissingTableError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  return /does not exist|schema cache|could not find the table/i.test(error.message ?? "");
}
