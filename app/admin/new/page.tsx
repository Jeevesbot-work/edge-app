"use client";

import { useState } from "react";

const S = {
  bg: "#0E1014",
  surface: "#171B21",
  card: "#13161A",
  border: "#252A32",
  bronze: "#C8965A",
  text: "#F2F1ED",
  sub: "#9BA3AF",
  muted: "#3D434D",
  green: "#34D399",
} as const;

interface Recipe { name: string; tag: string; emoji: string; p: number; kcal: number }
interface ScheduleDay { day: string; label: string; type: string; sessionKey: string | null }
interface Progression { week: number; label: string; sets: string; rpe: string }
interface Exercise { name: string }
interface SessionObj { name: string; exercises: Exercise[] }
interface Programme {
  title: string;
  subtitle: string;
  owner: string;
  summary: string;
  lengthWeeks: number;
  considerations: string[];
  weeklySchedule: ScheduleDay[];
  progression: Progression[];
  nutrition: { headline: string; targets: string[]; recipes: Recipe[]; proteinTarget: number; calorieTarget: number };
}
interface Generated { programme: Programme; sessions: Record<string, SessionObj> }

const label: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: 9, color: S.sub, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6, display: "block" };
const inputStyle: React.CSSProperties = { width: "100%", background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: "12px 14px", color: S.text, fontFamily: "Inter, sans-serif", fontSize: 14, outline: "none", marginBottom: 16 };
const card: React.CSSProperties = { background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: 18, marginBottom: 14 };

export default function NewClientPage() {
  const [step, setStep] = useState<"intake" | "review" | "done">("intake");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "", email: "", age: "", goal: "", days_per_week: "3",
    training_state: "", injuries: "", equipment: "full gym", experience: "", dietary: "", medical: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const [gen, setGen] = useState<Generated | null>(null);
  const [tweak, setTweak] = useState("");
  const [result, setResult] = useState<{ magicLink: string; emailSent: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate(isTweak = false) {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/generate-programme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          days_per_week: parseInt(form.days_per_week) || 3,
          ...(isTweak && gen ? { tweak, previous: gen } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Generation failed"); setBusy(false); return; }
      setGen(data as Generated);
      setTweak("");
      setStep("review");
    } catch {
      setError("Something went wrong generating. Try again.");
    }
    setBusy(false);
  }

  async function save() {
    if (!gen) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email, full_name: form.full_name, age: form.age,
          goal: form.goal, training_state: form.training_state, injuries: form.injuries,
          days_per_week: parseInt(form.days_per_week) || 3,
          programme: gen.programme, sessions: gen.sessions,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed"); setBusy(false); return; }
      setResult({ magicLink: data.magicLink, emailSent: data.emailSent });
      setStep("done");
    } catch {
      setError("Something went wrong saving. Try again.");
    }
    setBusy(false);
  }

  return (
    <div style={{ minHeight: "100svh", background: S.bg, padding: "32px 20px 80px", maxWidth: 560, margin: "0 auto" }}>
      <p style={{ ...label, color: S.bronze }}>Back2Strong · Admin</p>
      <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 30, color: S.text, fontWeight: 400, margin: "4px 0 24px" }}>New client</h1>

      {error && (
        <div style={{ ...card, borderColor: "rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)" }}>
          <p style={{ color: "#FCA5A5", fontFamily: "Inter, sans-serif", fontSize: 13 }}>{error}</p>
        </div>
      )}

      {step === "intake" && (
        <>
          <div style={card}>
            <label style={label}>Full name *</label>
            <input style={inputStyle} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Barry Smith" />
            <label style={label}>Email *</label>
            <input style={inputStyle} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="barry@email.com" type="email" />
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={label}>Age</label>
                <input style={inputStyle} value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="47" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>Days / week</label>
                <input style={inputStyle} value={form.days_per_week} onChange={(e) => set("days_per_week", e.target.value)} placeholder="3" />
              </div>
            </div>
            <label style={label}>Main goal</label>
            <input style={inputStyle} value={form.goal} onChange={(e) => set("goal", e.target.value)} placeholder="Lose fat, get strong again, sustainable" />
            <label style={label}>Injuries / history</label>
            <input style={inputStyle} value={form.injuries} onChange={(e) => set("injuries", e.target.value)} placeholder="Dodgy lower back, left shoulder" />
            <label style={label}>Equipment</label>
            <input style={inputStyle} value={form.equipment} onChange={(e) => set("equipment", e.target.value)} placeholder="Full gym / dumbbells only / home" />
            <label style={label}>Experience</label>
            <input style={inputStyle} value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="Trained years ago, been off 5 years" />
            <label style={label}>Dietary notes</label>
            <input style={inputStyle} value={form.dietary} onChange={(e) => set("dietary", e.target.value)} placeholder="Hates fish, busy mornings" />
            <label style={label}>Medical flags</label>
            <input style={{ ...inputStyle, marginBottom: 0 }} value={form.medical} onChange={(e) => set("medical", e.target.value)} placeholder="T1 diabetes / none" />
          </div>
          <button
            onClick={() => generate(false)}
            disabled={busy || !form.full_name || !form.email}
            style={{ width: "100%", background: busy || !form.full_name || !form.email ? S.muted : S.bronze, color: "#0E1014", border: "none", borderRadius: 12, padding: "15px", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer" }}
          >
            {busy ? "Generating programme…" : "Generate programme →"}
          </button>
        </>
      )}

      {step === "review" && gen && (
        <>
          <div style={card}>
            <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, color: S.text, marginBottom: 2 }}>{gen.programme.title}</p>
            <p style={{ ...label, color: S.bronze, marginBottom: 12 }}>{gen.programme.subtitle}</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: S.sub, lineHeight: 1.6 }}>{gen.programme.summary}</p>
          </div>

          <div style={card}>
            <p style={label}>Week schedule</p>
            {gen.programme.weeklySchedule?.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < gen.programme.weeklySchedule.length - 1 ? `1px solid ${S.border}` : "none" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: S.text }}>{d.day}</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: d.type === "lift" ? S.bronze : S.sub }}>{d.label}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <p style={label}>Sessions</p>
            {Object.entries(gen.sessions).map(([k, s]) => (
              <p key={k} style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: S.text, padding: "4px 0" }}>
                {s.name} <span style={{ color: S.muted }}>· {s.exercises?.length ?? 0} exercises</span>
              </p>
            ))}
          </div>

          <div style={card}>
            <p style={label}>Fuel</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: S.sub, lineHeight: 1.6, marginBottom: 10 }}>{gen.programme.nutrition?.headline}</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: S.text }}>
              {gen.programme.nutrition?.proteinTarget}g protein · {gen.programme.nutrition?.calorieTarget} kcal · {gen.programme.nutrition?.recipes?.length ?? 0} recipes
            </p>
          </div>

          <div style={card}>
            <label style={label}>Want to tweak it? Say what to change.</label>
            <input style={{ ...inputStyle, marginBottom: 12 }} value={tweak} onChange={(e) => setTweak(e.target.value)} placeholder="Make Day C harder, swap fish for chicken…" />
            <button onClick={() => generate(true)} disabled={busy || !tweak} style={{ width: "100%", background: "transparent", color: busy || !tweak ? S.muted : S.bronze, border: `1px solid ${busy || !tweak ? S.border : S.bronze}`, borderRadius: 12, padding: "12px", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer" }}>
              {busy ? "Reworking…" : "Regenerate with changes"}
            </button>
          </div>

          <button onClick={save} disabled={busy} style={{ width: "100%", background: busy ? S.muted : S.green, color: "#0E1014", border: "none", borderRadius: 12, padding: "15px", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer", marginBottom: 10 }}>
            {busy ? "Saving…" : "Save & create login →"}
          </button>
          <button onClick={() => setStep("intake")} disabled={busy} style={{ width: "100%", background: "transparent", color: S.sub, border: "none", padding: "8px", fontFamily: "Inter, sans-serif", fontSize: 12, cursor: "pointer" }}>
            ← Back to details
          </button>
        </>
      )}

      {step === "done" && result && (
        <>
          <div style={{ ...card, borderColor: "rgba(52,211,153,0.4)", background: "rgba(52,211,153,0.08)" }}>
            <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, color: S.text, marginBottom: 6 }}>{form.full_name.split(" ")[0]} is in.</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: S.sub, lineHeight: 1.6 }}>
              Account created and their programme is attached. They&apos;ll see it the moment they log in.
              {result.emailSent ? " A welcome email has been sent." : " (Email didn't send — use the link below instead.)"}
            </p>
          </div>

          <div style={card}>
            <p style={label}>One-time login link — send it on WhatsApp</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: S.text, wordBreak: "break-all", background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, padding: 12, lineHeight: 1.5 }}>{result.magicLink}</p>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                onClick={() => { navigator.clipboard?.writeText(result.magicLink); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                style={{ flex: 1, background: S.bronze, color: "#0E1014", border: "none", borderRadius: 10, padding: "12px", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
              >
                {copied ? "Copied ✓" : "Copy link"}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`You're in. Tap to open your Back2Strong Edge app: ${result.magicLink}`)}`}
                target="_blank" rel="noreferrer"
                style={{ flex: 1, background: "transparent", color: S.green, border: `1px solid ${S.green}`, borderRadius: 10, padding: "12px", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", textAlign: "center", textDecoration: "none" }}
              >
                WhatsApp
              </a>
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: S.muted, marginTop: 10, lineHeight: 1.5 }}>Link is one-time and expires soon. If they miss it, onboard isn&apos;t lost — they just request a fresh link from the login screen.</p>
          </div>

          <button onClick={() => { setForm({ full_name: "", email: "", age: "", goal: "", days_per_week: "3", training_state: "", injuries: "", equipment: "full gym", experience: "", dietary: "", medical: "" }); setGen(null); setResult(null); setStep("intake"); }} style={{ width: "100%", background: S.surface, color: S.text, border: `1px solid ${S.border}`, borderRadius: 12, padding: "14px", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Onboard another client
          </button>
        </>
      )}
    </div>
  );
}
