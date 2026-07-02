"use client";

import { useState } from "react";
import { BARRY_PROGRAMME_BLOCK2, BARRY_BLOCK2_SESSIONS } from "@/lib/data/barry-programme-block2";

const B = "#C8A86E";
const BG = "#0E1014";
const SURFACE = "#171B21";
const BORDER = "#252A32";
const MUTED = "#9BA3AF";
const TEXT = "#F2F1ED";
const inter = "Inter, sans-serif";
const fraunces = "Fraunces, Georgia, serif";

type Screen = "train" | "session-a" | "session-b" | "checkin";

export default function BarryB2Preview() {
  const [screen, setScreen] = useState<Screen>("train");
  const [week, setWeek] = useState(1);

  const prog = BARRY_PROGRAMME_BLOCK2;
  const weekInfo = prog.progression[week - 1];
  const sessionA = BARRY_BLOCK2_SESSIONS["session-a"];
  const sessionB = BARRY_BLOCK2_SESSIONS["session-b"];

  return (
    <div style={{ minHeight: "100svh", background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 40px" }}>

      {/* Admin header */}
      <div style={{ width: "100%", maxWidth: 420, marginBottom: 16 }}>
        <div style={{ background: "rgba(200,168,110,0.08)", border: "1px solid rgba(200,168,110,0.25)", borderRadius: 14, padding: "14px 18px" }}>
          <p style={{ fontFamily: inter, fontSize: 11, color: B, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>
            PREVIEW — Barry Block 2: Starter Weights
          </p>
          <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
            This is exactly what Barry sees. Tap tabs to explore each section.
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4].map((w) => (
              <button key={w} onClick={() => setWeek(w)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 10,
                border: `1px solid ${week === w ? B : "rgba(200,168,110,0.2)"}`,
                background: week === w ? "rgba(200,168,110,0.15)" : "transparent",
                fontFamily: inter, fontSize: 11, fontWeight: 700,
                color: week === w ? B : MUTED, cursor: "pointer",
              }}>Wk {w}</button>
            ))}
          </div>
          {weekInfo && (
            <div style={{ marginTop: 10, background: "rgba(200,168,110,0.05)", borderRadius: 8, padding: "8px 12px" }}>
              <p style={{ fontFamily: inter, fontSize: 11, color: B, fontWeight: 600, marginBottom: 2 }}>Week {week}: {weekInfo.label}</p>
              <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, lineHeight: 1.4 }}>{weekInfo.change}</p>
            </div>
          )}
        </div>
      </div>

      {/* Phone frame */}
      <div style={{
        width: "100%", maxWidth: 390, background: BG,
        borderRadius: 44, border: "8px solid #1C1C1E",
        boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px #2C2C2E",
        overflow: "hidden", minHeight: 780,
        display: "flex", flexDirection: "column", position: "relative",
      }}>
        {/* Status bar */}
        <div style={{ background: BG, padding: "14px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 600, color: TEXT }}>9:41</span>
          <div style={{ width: 25, height: 12, border: `1.5px solid ${TEXT}`, borderRadius: 4, padding: 1.5, display: "flex", alignItems: "center" }}>
            <div style={{ width: "75%", height: "100%", background: TEXT, borderRadius: 2 }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
          {screen === "train" && <TrainScreen prog={prog} currentWeek={week} weekInfo={weekInfo} />}
          {screen === "session-a" && <SessionScreen session={sessionA} currentWeek={week} />}
          {screen === "session-b" && <SessionScreen session={sessionB} currentWeek={week} />}
          {screen === "checkin" && <CheckInScreen prog={prog} />}
        </div>

        {/* Bottom nav */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "rgba(14,16,20,0.95)", borderTop: `1px solid ${BORDER}`,
          display: "flex", paddingBottom: 20, paddingTop: 10,
        }}>
          {([
            { key: "train" as const, label: "Train", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { key: "session-a" as const, label: "Session A", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { key: "session-b" as const, label: "Session B", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
            { key: "checkin" as const, label: "Check-in", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          ]).map(({ key, label, icon }) => (
            <button key={key} onClick={() => setScreen(key)} style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={screen === key ? B : MUTED} strokeWidth={1.8} style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              <span style={{ fontFamily: inter, fontSize: 9, color: screen === key ? B : MUTED, fontWeight: screen === key ? 600 : 400 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <p style={{ maxWidth: 390, width: "100%", marginTop: 16, fontFamily: inter, fontSize: 11, color: MUTED, textAlign: "center", lineHeight: 1.6 }}>
        Admin preview only — Barry cannot access this page.<br />
        Use the week buttons above to preview each week before assigning.
      </p>
    </div>
  );
}

function TrainScreen({ prog, currentWeek, weekInfo }: { prog: typeof BARRY_PROGRAMME_BLOCK2; currentWeek: number; weekInfo: typeof BARRY_PROGRAMME_BLOCK2.progression[0] }) {
  const today = new Date().getDay();
  const DAY_JS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return (
    <div style={{ padding: "16px 20px" }}>
      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 4 }}>
        Block 2 · Week {currentWeek} of {prog.lengthWeeks}
      </p>
      <h1 style={{ fontFamily: fraunces, fontSize: 36, fontWeight: 400, color: TEXT, lineHeight: 1, marginBottom: 4 }}>Train.</h1>
      <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, marginBottom: 12 }}>{prog.title} · {prog.subtitle}</p>

      {/* Week progress */}
      <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
        {[1, 2, 3, 4].map((w) => (
          <div key={w} style={{ flex: 1, height: 2, borderRadius: 99, background: w <= currentWeek ? B : BORDER, opacity: w === currentWeek ? 1 : 0.5 }} />
        ))}
      </div>

      {/* Week card */}
      <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid rgba(200,168,110,0.2)`, padding: 20, marginBottom: 14 }}>
        <p style={{ fontFamily: inter, fontSize: 9, color: B, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4 }}>
          Week {currentWeek} — {weekInfo.label}
        </p>
        <p style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.6)", lineHeight: 1.5, marginBottom: 14 }}>{weekInfo.change}</p>
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, paddingTop: 12 }}>
          <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
            <span style={{ color: "rgba(242,241,237,0.45)" }}>Rule: </span>{prog.progressionRule}
          </p>
        </div>
      </div>

      {/* Weekly schedule */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {prog.weeklySchedule.map(({ day, type }) => {
          const isToday = DAY_JS[day] === today;
          return (
            <div key={day} style={{
              flex: 1, textAlign: "center",
              background: isToday ? "rgba(200,168,110,0.12)" : type === "rest" ? BG : SURFACE,
              borderRadius: 10, padding: "8px 2px",
              border: `1px solid ${isToday ? "rgba(200,168,110,0.4)" : BORDER}`,
            }}>
              <p style={{ fontFamily: inter, fontSize: 9, fontWeight: 700, color: isToday ? B : MUTED, letterSpacing: "0.06em" }}>{day}</p>
              <p style={{ fontFamily: inter, fontSize: 8, color: type === "rest" ? "#3D434D" : MUTED, marginTop: 2 }}>
                {type === "rest" ? "off" : type === "lift" ? "lift" : "walk"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sessions */}
      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>This week</p>
      {[
        { key: "session-a", label: "Session A", note: "Chest press · Seated row · Glute bridge" },
        { key: "session-b", label: "Session B", note: "Leg press · Shoulder press · Lat pulldown · RDL" },
      ].map((s) => (
        <div key={s.key} style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: "18px 20px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(200,168,110,0.1)", border: "1px solid rgba(200,168,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 20 }}>🏋️</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: fraunces, fontSize: 18, color: TEXT, fontWeight: 400, marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontFamily: inter, fontSize: 11, color: MUTED }}>4 exercises · 35 min · 3 sets each</p>
              <p style={{ fontFamily: inter, fontSize: 11, color: "rgba(200,168,110,0.7)", marginTop: 2 }}>{s.note}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2} style={{ width: 16, height: 16, flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}

      {/* Post-session walk */}
      <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚶</span>
          <div>
            <p style={{ fontFamily: fraunces, fontSize: 17, color: TEXT, fontWeight: 400 }}>Post-session walk</p>
            <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, marginTop: 2 }}>10 min immediately after lifting · not optional</p>
          </div>
        </div>
      </div>

      {/* Considerations */}
      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>Ground rules</p>
      <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 20 }}>
        {prog.considerations.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < prog.considerations.length - 1 ? 10 : 0 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: B, flexShrink: 0, marginTop: 5 }} />
            <p style={{ fontFamily: inter, fontSize: 12, color: "rgba(242,241,237,0.7)", lineHeight: 1.5 }}>{c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionScreen({ session, currentWeek }: { session: typeof BARRY_BLOCK2_SESSIONS["session-a"]; currentWeek: number }) {
  return (
    <div style={{ padding: "16px 20px" }}>
      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 4 }}>
        Week {currentWeek} · 35 minutes
      </p>
      <h1 style={{ fontFamily: fraunces, fontSize: 36, fontWeight: 400, color: TEXT, lineHeight: 1, marginBottom: 4 }}>{session.name}.</h1>
      <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, marginBottom: 20 }}>3 sets · 10–12 reps · 2–3 min rest between sets</p>

      {/* Warm-up */}
      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Warm-up</p>
      <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "14px 18px", marginBottom: 20 }}>
        {session.warmup?.map((w, i) => (
          <p key={i} style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.7)", lineHeight: 1.5, marginBottom: i < (session.warmup?.length ?? 0) - 1 ? 6 : 0 }}>
            {i + 1}. {w}
          </p>
        ))}
      </div>

      {/* Exercises */}
      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Exercises</p>
      {session.exercises.map((ex, i) => (
        <div key={i} style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 20, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(200,168,110,0.15)", border: "1px solid rgba(200,168,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: inter, fontSize: 12, fontWeight: 700, color: B }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: fraunces, fontSize: 17, color: TEXT, fontWeight: 400, lineHeight: 1.2, marginBottom: 4 }}>{ex.name}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontFamily: inter, fontSize: 11, color: B, fontWeight: 600 }}>{ex.sets} sets</span>
                <span style={{ fontFamily: inter, fontSize: 11, color: MUTED }}>×</span>
                <span style={{ fontFamily: inter, fontSize: 11, color: B, fontWeight: 600 }}>{ex.reps} reps</span>
                {ex.rest && <span style={{ fontFamily: inter, fontSize: 11, color: MUTED }}>{ex.rest} rest</span>}
              </div>
            </div>
          </div>
          {ex.weight && (
            <div style={{ background: "rgba(200,168,110,0.06)", border: "1px solid rgba(200,168,110,0.15)", borderRadius: 10, padding: "8px 12px", marginBottom: 8 }}>
              <p style={{ fontFamily: inter, fontSize: 11, color: "rgba(200,168,110,0.9)" }}>⚖️ {ex.weight}</p>
            </div>
          )}
          {ex.notes && (
            <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{ex.notes}</p>
          )}
        </div>
      ))}

      {/* Finisher */}
      {session.finisher && (
        <div style={{ background: "rgba(200,168,110,0.06)", border: "1px solid rgba(200,168,110,0.2)", borderRadius: 16, padding: "14px 18px", marginBottom: 20 }}>
          <p style={{ fontFamily: inter, fontSize: 9, color: B, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Optional finisher</p>
          <p style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.75)", lineHeight: 1.5 }}>{session.finisher}</p>
        </div>
      )}

      {/* Coach note */}
      {session.coachNote && (
        <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "14px 18px" }}>
          <p style={{ fontFamily: inter, fontSize: 9, color: B, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Nick&apos;s note</p>
          <p style={{ fontFamily: inter, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{session.coachNote}</p>
        </div>
      )}
    </div>
  );
}

function CheckInScreen({ prog }: { prog: typeof BARRY_PROGRAMME_BLOCK2 }) {
  return (
    <div style={{ padding: "16px 20px" }}>
      <h1 style={{ fontFamily: fraunces, fontSize: 36, fontWeight: 400, color: TEXT, lineHeight: 1, marginBottom: 6 }}>Check In.</h1>
      <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, marginBottom: 24 }}>{prog.checkIn.frequency}</p>
      <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 20 }}>
        <p style={{ fontFamily: inter, fontSize: 9, color: B, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14 }}>After each session</p>
        {prog.checkIn.fields.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, border: `1.5px solid #3D434D`, flexShrink: 0 }} />
            <p style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.75)" }}>{f}</p>
          </div>
        ))}
        <button style={{
          width: "100%", background: B, color: BG, border: "none", borderRadius: 14,
          padding: "14px", fontFamily: inter, fontSize: 13, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer", marginTop: 6,
        }}>Submit Check-in</button>
      </div>
    </div>
  );
}
