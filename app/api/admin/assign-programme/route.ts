import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { BARRY_PROGRAMME } from "@/lib/data/barry-programme";
import { BARRY_PROGRAMME_BLOCK2, BARRY_BLOCK2_SESSIONS } from "@/lib/data/barry-programme-block2";
import { ALEX_GALE_PROGRAMME } from "@/lib/data/alex-gale-programme";

const PROGRAMMES: Record<string, { programme: unknown; sessions?: unknown }> = {
  "barry-strong90-block1": { programme: BARRY_PROGRAMME, sessions: {} },
  "barry-strong90-block2": { programme: BARRY_PROGRAMME_BLOCK2, sessions: BARRY_BLOCK2_SESSIONS },
  "alex-gale-strong90-block1": { programme: ALEX_GALE_PROGRAMME, sessions: {} },
};

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !["n.adams3@icloud.com","nicosmada3@googlemail.com","nick@back2strong.online"].includes(user.email ?? "")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { userId, programmeId } = await req.json();
  if (!userId || !programmeId) {
    return NextResponse.json({ error: "Missing userId or programmeId" }, { status: 400 });
  }

  const entry = PROGRAMMES[programmeId];
  if (!entry) {
    return NextResponse.json({ error: "Unknown programme" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("client_programmes")
    .upsert({ user_id: userId, programme: entry.programme, sessions: entry.sessions ?? {} }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin
    .from("programme_state")
    .upsert({ user_id: userId, current_week: 1, current_day: 1 }, { onConflict: "user_id" });

  return NextResponse.json({ ok: true });
}
