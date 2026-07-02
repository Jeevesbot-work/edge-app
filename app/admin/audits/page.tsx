import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["n.adams3@icloud.com", "nicosmada3@googlemail.com", "nick@back2strong.online"];

const S = { bg: "#0E1014", surface: "#171B21", border: "#252A32", bronze: "#C8965A", text: "#F2F1ED", sub: "#9BA3AF", muted: "#3D434D", green: "#34D399" };

interface AuditRow {
  id: string;
  full_name: string | null;
  email: string | null;
  status: string;
  created_at: string;
  data: Record<string, unknown>;
}

export default async function AuditInboxPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) redirect("/login");

  const admin = createAdminClient();

  // Audits live in coach_notes tagged "audit:*" (proven table, no schema-cache risk).
  const { data } = await admin
    .from("coach_notes")
    .select("id, title, body, tag, created_at")
    .like("tag", "audit:%")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows: AuditRow[] = (data ?? []).map((n: { id: string; title: string | null; body: string | null; tag: string | null; created_at: string }) => {
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(n.body ?? "{}"); } catch { parsed = {}; }
    return {
      id: n.id,
      full_name: n.title,
      email: (parsed.email as string) ?? null,
      status: n.tag === "audit:onboarded" ? "onboarded" : "new",
      created_at: n.created_at,
      data: parsed,
    };
  });

  return (
    <div style={{ minHeight: "100svh", background: S.bg, padding: "32px 20px 80px", maxWidth: 640, margin: "0 auto" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, color: S.bronze, textTransform: "uppercase", letterSpacing: "0.18em" }}>Back2Strong · Admin</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "4px 0 24px" }}>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 30, color: S.text, fontWeight: 400 }}>Audit inbox</h1>
        <Link href="/admin" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: S.sub, textDecoration: "none" }}>← Command Centre</Link>
      </div>

      {rows.length === 0 && (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24, textAlign: "center" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: S.sub, lineHeight: 1.6 }}>No audits yet. When someone completes your audit, it lands here — ready to turn into a programme in one tap.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((r) => {
          const onboarded = r.status === "onboarded";
          const goal = (r.data?.ninety_day_goal as string) || (r.data?.age_limitations as string) || "";
          const committed = r.data?.committed as string | undefined;
          return (
            <div key={r.id} style={{ background: S.surface, border: `1px solid ${onboarded ? S.border : "rgba(200,150,90,0.3)"}`, borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 19, color: S.text }}>{r.full_name || "Unknown"}</p>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: onboarded ? S.green : S.bronze }}>{onboarded ? "Onboarded ✓" : "New"}</span>
              </div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: S.sub, marginBottom: 4 }}>{r.email || "no email"} · {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}{committed ? ` · committed: ${committed}` : ""}</p>
              {goal && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: S.text, lineHeight: 1.5, margin: "8px 0 12px" }}>“{goal.length > 120 ? goal.slice(0, 120) + "…" : goal}”</p>}
              {!onboarded && (
                <Link href={`/admin/new?audit=${r.id}`} style={{ display: "inline-block", background: S.bronze, color: "#0E1014", borderRadius: 10, padding: "10px 18px", textDecoration: "none", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Build programme →</Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
