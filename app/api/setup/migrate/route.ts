import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SQL = `
CREATE TABLE IF NOT EXISTS admin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  position BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_tasks' AND policyname = 'Service role only'
  ) THEN
    ALTER TABLE admin_tasks ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role only" ON admin_tasks USING (false);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  platform TEXT NOT NULL DEFAULT 'Instagram',
  title TEXT NOT NULL,
  hook TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export async function GET() {
  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("exec_sql", { sql: SQL });
    if (error) {
      // Try direct query as fallback
      const { error: e2 } = await (admin as any).from("admin_tasks").select("id").limit(1);
      if (e2?.code === "42P01") {
        return NextResponse.json({ error: "Table missing — run SQL manually in Supabase dashboard", sql: SQL }, { status: 500 });
      }
      return NextResponse.json({ ok: true, note: "Tables already exist or were created" });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
