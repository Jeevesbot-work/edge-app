import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// One-time, idempotent setup:
//  1) free training_sessions.session_type (so weights sessions log)
//  2) create walk_logs table + RLS
//  3) seed Barry's real programme start date + starting weight
// Trigger once with ?run=1. Safe to re-run.
const MIGRATION = `
ALTER TABLE training_sessions DROP CONSTRAINT IF EXISTS training_sessions_session_type_check;

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
CREATE POLICY "walk_logs own select" ON walk_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "walk_logs own insert" ON walk_logs;
CREATE POLICY "walk_logs own insert" ON walk_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "walk_logs own delete" ON walk_logs;
CREATE POLICY "walk_logs own delete" ON walk_logs FOR DELETE USING (auth.uid() = user_id);
`;

// Barry's real dates: signed up 14 Jun 2026; weighed 125.9kg on 13 Jun 2026.
const BARRY_SEED = `
UPDATE programme_state ps
  SET start_date = '2026-06-14'
  FROM profiles p
  WHERE ps.user_id = p.id AND p.email = 'barrywkavanagh@gmail.com';

INSERT INTO check_ins (user_id, date, weight_kg)
  SELECT p.id, '2026-06-13', 125.9 FROM profiles p WHERE p.email = 'barrywkavanagh@gmail.com'
  ON CONFLICT (user_id, date) DO UPDATE SET weight_kg = 125.9;
`;

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("run") !== "1") {
    return NextResponse.json({ error: "Add ?run=1 to execute" }, { status: 400 });
  }
  try {
    const admin = createAdminClient();
    const { error: mErr } = await admin.rpc("exec_sql", { sql: MIGRATION });
    if (mErr) return NextResponse.json({ step: "migration", error: mErr.message }, { status: 500 });

    const { error: sErr } = await admin.rpc("exec_sql", { sql: BARRY_SEED });
    if (sErr) return NextResponse.json({ step: "barry_seed", error: sErr.message }, { status: 500 });

    // Verify.
    const { data: barry } = await admin
      .from("profiles").select("id").eq("email", "barrywkavanagh@gmail.com").single();
    const { data: state } = barry
      ? await admin.from("programme_state").select("start_date").eq("user_id", barry.id).single()
      : { data: null };
    const { data: w } = barry
      ? await admin.from("check_ins").select("date, weight_kg").eq("user_id", barry.id).eq("date", "2026-06-13").single()
      : { data: null };

    return NextResponse.json({ ok: true, barryStartDate: state?.start_date ?? null, barrySeedWeight: w ?? null });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
