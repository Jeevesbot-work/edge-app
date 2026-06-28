import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { BARRY_PROGRAMME } from "@/lib/data/barry-programme";

const PROGRAMMES: Record<string, unknown> = {
  "barry-strong90-block1": BARRY_PROGRAMME,
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

  const programme = PROGRAMMES[programmeId];
  if (!programme) {
    return NextResponse.json({ error: "Unknown programme" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("client_programmes")
    .upsert({ user_id: userId, programme, sessions: {} }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin
    .from("programme_state")
    .upsert({ user_id: userId, current_week: 1, current_day: 1 }, { onConflict: "user_id" });

  return NextResponse.json({ ok: true });
}
