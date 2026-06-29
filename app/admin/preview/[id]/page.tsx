import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getProgrammeWeek, blockSessionKeys } from "@/lib/data/programme-loader";
import type { Programme, ClientProgramme } from "@/types";
import SessionCards from "@/components/SessionCards";

const ADMIN_EMAILS = ["n.adams3@icloud.com", "nicosmada3@googlemail.com", "nick@back2strong.online"];

export default async function AdminPreviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) redirect("/login");

  const admin = createAdminClient();
  const userId = params.id;

  const [{ data: profile }, { data: cpRow }, { data: progState }] = await Promise.all([
    admin.from("profiles").select("full_name, email").eq("id", userId).single(),
    admin.from("client_programmes").select("programme, sessions").eq("user_id", userId).maybeSingle(),
    admin.from("programme_state").select("current_week").eq("user_id", userId).single(),
  ]);

  if (!cpRow?.programme) {
    return (
      <div className="min-h-screen bg-edge-bg flex flex-col items-center justify-center gap-4">
        <p className="text-white font-condensed text-xl">No programme loaded for this client.</p>
        <Link href={`/admin/users/${userId}`} className="text-edge-bronze text-sm underline">Back to profile</Link>
      </div>
    );
  }

  const prog = cpRow.programme as Programme;
  const sessions = (cpRow.sessions ?? {}) as ClientProgramme["sessions"];
  const currentWeek = Math.max(1, Math.min(progState?.current_week ?? 1, prog.lengthWeeks));
  const weekInfo = getProgrammeWeek(prog, currentWeek);
  const blockKeys = blockSessionKeys(prog, currentWeek);

  return (
    <div className="min-h-screen bg-edge-bg">
      {/* Admin preview banner */}
      <div style={{ background: "#C8965A", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: "#0A0A0A", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          PREVIEW — {profile?.full_name ?? profile?.email ?? userId}
        </p>
        <Link href={`/admin/users/${userId}`} style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#0A0A0A", textDecoration: "underline" }}>
          ← Back to admin
        </Link>
      </div>

      {/* Train page — exact replica of what client sees */}
      <div className="max-w-lg mx-auto px-5 pb-28 pt-6">

        <div style={{ paddingBottom: 20 }}>
          <p style={{ fontSize: 9, color: "#9BA3AF", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "Inter, sans-serif", marginBottom: 4 }}>
            0 of {blockKeys.size} sessions this week
          </p>
          <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 36, fontWeight: 400, color: "#F2F1ED", lineHeight: 1, marginBottom: 4 }}>
            Train.
          </h1>
          <p style={{ fontSize: 12, color: "#9BA3AF", fontFamily: "Inter, sans-serif" }}>
            {prog.title} · {prog.subtitle}
          </p>
          <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
            {[1, 2, 3, 4].map((w) => (
              <div key={w} style={{
                flex: 1, height: 2, borderRadius: 99,
                background: w === currentWeek ? "#C8965A" : "#252A32",
              }} />
            ))}
          </div>
        </div>

        {/* Week card */}
        <div style={{ background: "#171B21", borderRadius: 20, border: "1px solid rgba(200,150,90,0.2)", padding: "20px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 9, color: "#C8965A", textTransform: "uppercase", letterSpacing: "0.18em", fontFamily: "Inter, sans-serif", marginBottom: 4 }}>
                Week {currentWeek} of {prog.lengthWeeks}
              </p>
              <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 26, fontWeight: 400, color: "#F2F1ED", lineHeight: 1 }}>
                {weekInfo.label}
              </h2>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "rgba(242,241,237,0.6)", fontFamily: "Inter, sans-serif", lineHeight: 1.5, marginBottom: 14 }}>
            {weekInfo.change}
          </p>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
            <p style={{ fontSize: 11, color: "#9BA3AF", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
              <span style={{ color: "rgba(242,241,237,0.45)" }}>Rule: </span>
              {prog.progressionRule}
            </p>
          </div>
        </div>

        {/* Weekly schedule strip */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {prog.weeklySchedule.map(({ day, type }) => (
              <div key={day} style={{
                flex: 1, textAlign: "center",
                background: type === "lift" ? "#171B21" : "#0E1014",
                borderRadius: 10, padding: "8px 2px", border: "1px solid #252A32",
              }}>
                <p style={{ fontSize: 9, fontFamily: "Inter, sans-serif", fontWeight: 700, color: type === "lift" ? "#9BA3AF" : "#252A32", letterSpacing: "0.06em" }}>
                  {day}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Session cards */}
        <div style={{ marginBottom: 24 }}>
          <SessionCards
            weeklySchedule={prog.weeklySchedule}
            sessions={sessions}
            supabaseDoneTypes={[]}
            currentWeek={currentWeek}
            weekInfo={weekInfo}
          />
        </div>

        {/* Nutrition summary */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 9, color: "#9BA3AF", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "Inter, sans-serif", marginBottom: 12 }}>Nutrition</p>
          <div style={{ background: "#171B21", borderRadius: 20, border: "1px solid #252A32", padding: "20px" }}>
            <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 16, color: "#F2F1ED", marginBottom: 16, lineHeight: 1.45 }}>
              {prog.nutrition.headline}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {prog.nutrition.targets.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C8965A", flexShrink: 0, marginTop: 5 }} />
                  <p style={{ fontSize: 13, color: "rgba(242,241,237,0.75)", fontFamily: "Inter, sans-serif", lineHeight: 1.4 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RPE note */}
        <div style={{ background: "#13161A", borderRadius: 16, border: "1px solid #252A32", padding: "14px 18px" }}>
          <p style={{ fontSize: 9, color: "#9BA3AF", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "Inter, sans-serif", marginBottom: 6 }}>RPE guide</p>
          <p style={{ fontSize: 13, color: "rgba(242,241,237,0.6)", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{prog.rpeNote}</p>
        </div>
      </div>
    </div>
  );
}
