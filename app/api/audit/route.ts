import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { AUDIT_TABLE_SQL } from "@/lib/auditTable";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const d = await req.json();

  // Store the submission so it lands in the admin audit inbox. Best-effort:
  // a storage failure must never block the client's submission.
  // We create-and-insert in ONE exec_sql call (direct to Postgres), which bypasses
  // the PostgREST schema cache entirely — so it works even the first time, before
  // the cache has caught up with the new table.
  try {
    const admin = createAdminClient();
    const esc = (v: unknown) => (v === null || v === undefined || v === "") ? "NULL" : "'" + String(v).replace(/'/g, "''") + "'";
    const dataLiteral = JSON.stringify(d).replace(/'/g, "''");
    const sql = `${AUDIT_TABLE_SQL}
INSERT INTO audit_submissions (full_name, email, phone, data, status)
VALUES (${esc(d.full_name)}, ${esc(d.email)}, ${esc(d.phone)}, '${dataLiteral}'::jsonb, 'new');`;
    const { error } = await admin.rpc("exec_sql", { sql });
    if (error) console.error("[audit] store failed:", error.message);
  } catch (e) {
    console.error("[audit] store exception:", e);
  }

  const avgEnergy = (
    (d.morning_energy + d.afternoon_energy + d.motivation + d.sleep_quality + d.recovery + d.stress + d.libido) / 7
  ).toFixed(1);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Inter, sans-serif; background: #0A0A0A; color: #F2F1ED; margin: 0; padding: 32px; }
  h1 { font-family: Georgia, serif; font-weight: 400; font-size: 28px; color: #C8965A; margin-bottom: 4px; }
  h2 { font-family: Georgia, serif; font-weight: 400; font-size: 18px; color: #C8965A; margin: 28px 0 12px; border-bottom: 1px solid rgba(200,150,90,0.2); padding-bottom: 8px; }
  .sub { font-size: 13px; color: #6B7280; margin-bottom: 28px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; vertical-align: top; }
  td:first-child { color: #6B7280; width: 200px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; padding-right: 16px; }
  .highlight { background: rgba(200,150,90,0.08); border: 1px solid rgba(200,150,90,0.2); border-radius: 8px; padding: 16px; margin: 8px 0; }
  .big { font-size: 32px; color: #C8965A; font-family: Georgia, serif; }
</style></head>
<body>
<h1>New Strong 90 Audit</h1>
<p class="sub">Submitted by ${d.full_name || "Unknown"} · ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>

<h2>Contact</h2>
<table>
  <tr><td>Name</td><td>${d.full_name || "—"}</td></tr>
  <tr><td>Email</td><td>${d.email || "—"}</td></tr>
  <tr><td>Phone / WhatsApp</td><td>${d.phone || "—"}</td></tr>
</table>

<h2>Performance Snapshot</h2>
<table>
  <tr><td>Age</td><td>${d.age || "—"}</td></tr>
  <tr><td>Height</td><td>${d.height || "—"}</td></tr>
  <tr><td>Weight</td><td>${d.weight || "—"}</td></tr>
  <tr><td>Waist (navel)</td><td>${d.waist ? d.waist + " inches" : "—"}</td></tr>
  <tr><td>Resting HR</td><td>${d.resting_hr ? d.resting_hr + " bpm" : "—"}</td></tr>
  <tr><td>Avg nightly sleep</td><td>${d.avg_sleep ? d.avg_sleep + " hours" : "—"}</td></tr>
  <tr><td>Alcohol nights/week</td><td>${d.alcohol_nights || "—"}</td></tr>
  <tr><td>Training days/week</td><td>${d.training_days || "—"}</td></tr>
  <tr><td>Structured program</td><td>${d.structured_program || "—"}</td></tr>
  <tr><td>Bloodwork (18mo)</td><td>${d.bloodwork || "—"}</td></tr>
  <tr><td>10 strict push-ups</td><td>${d.pushups || "—"}</td></tr>
  <tr><td>Hang 30 seconds</td><td>${d.hang || "—"}</td></tr>
  <tr><td>Floor without hands</td><td>${d.floor || "—"}</td></tr>
  <tr><td>10,000 steps</td><td>${d.steps || "—"}</td></tr>
</table>

<h2>Energy & Recovery</h2>
<div class="highlight">
  <span class="big">${avgEnergy}</span><span style="color:#6B7280;font-size:13px"> / 5 average</span>
</div>
<table>
  <tr><td>Morning energy</td><td>${d.morning_energy}/5</td></tr>
  <tr><td>Afternoon stability</td><td>${d.afternoon_energy}/5</td></tr>
  <tr><td>Motivation to train</td><td>${d.motivation}/5</td></tr>
  <tr><td>Sleep quality</td><td>${d.sleep_quality}/5</td></tr>
  <tr><td>Recovery</td><td>${d.recovery}/5</td></tr>
  <tr><td>Stress management</td><td>${d.stress}/5</td></tr>
  <tr><td>Libido</td><td>${d.libido}/5</td></tr>
</table>

<h2>Time & Priority</h2>
<table>
  <tr><td>Screen time/day</td><td>${d.screen_time || "—"}</td></tr>
  <tr><td>TV hours/week</td><td>${d.tv_hours || "—"}</td></tr>
  <tr><td>Social scroll/day</td><td>${d.social_scroll ? d.social_scroll + " mins" : "—"}</td></tr>
  <tr><td>Wake time</td><td>${d.wake_time || "—"}</td></tr>
  <tr><td>Bed time</td><td>${d.bed_time || "—"}</td></tr>
  <tr><td>Health priority (1–10)</td><td>${d.health_priority}/10</td></tr>
  <tr><td>Training barriers</td><td>${Array.isArray(d.barriers) && d.barriers.length ? d.barriers.join(", ") : "None selected"}</td></tr>
</table>

<h2>Age Narrative</h2>
<table>
  <tr><td>Limitations blamed on age</td><td>${d.age_limitations || "—"}</td></tr>
  <tr><td>Age or habit-related?</td><td>${d.habit_or_age || "—"}</td></tr>
</table>

<h2>Commitment</h2>
<table>
  <tr><td>Ready to commit</td><td><strong style="color:${d.committed === "Yes" ? "#34D399" : "#F87171"}">${d.committed || "—"}</strong></td></tr>
</table>

<h2>60-Year-Old Test</h2>
<table>
  <tr><td>Decade projection</td><td>${d.decade_projection || "—"}</td></tr>
  <tr><td>90-day goal</td><td>${d.ninety_day_goal || "—"}</td></tr>
</table>

<p style="margin-top:40px;font-size:11px;color:#6B7280;border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">Strong 90 · Midlife Performance Reset · app.back2strong.online</p>
</body>
</html>
  `;

  const { error } = await resend.emails.send({
    from: "Strong 90 Audit <noreply@back2strong.online>",
    to: "nick@back2strong.online",
    subject: `New Strong 90 Audit — ${d.full_name || "Unknown"} (Energy avg: ${avgEnergy}/5)`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
