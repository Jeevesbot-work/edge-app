export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { BARRY_PROGRAMME } from "@/lib/data/barry-programme";

export async function GET() {
  const admin = createAdminClient();

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id, full_name, email");

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  const barry = profiles?.find(
    (p) =>
      p.full_name?.toLowerCase().includes("barry") ||
      p.email?.toLowerCase().includes("barry")
  );

  if (!barry) {
    return NextResponse.json({
      error: "Barry not found — check user list below",
      users: profiles?.map((p) => ({ name: p.full_name, email: p.email })),
    }, { status: 404 });
  }

  const { error } = await admin
    .from("client_programmes")
    .upsert({ user_id: barry.id, programme: BARRY_PROGRAMME, sessions: {} }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin
    .from("programme_state")
    .upsert({ user_id: barry.id, current_week: 1, current_day: 1 }, { onConflict: "user_id" });

  return NextResponse.json({ ok: true, assigned_to: barry.full_name, email: barry.email });
}
