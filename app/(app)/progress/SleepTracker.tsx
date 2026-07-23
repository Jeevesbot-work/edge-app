"use client";

import { useState } from "react";

export type SleepNight = {
  date: string;
  quality: number | null;   // 1–10
  duration: number | null;  // hours
  bedtime: string | null;
  wake: string | null;
  // Matched context from that morning's check-in, so a poor night can be
  // explained: "what was different?"
  stress: number | null;    // 1–5
  energy: number | null;    // 1–5
  notes: string | null;
};

const B = "#C8A86E";
const SURFACE = "#171B21";
const BORDER = "#252A32";
const MUTED = "#9BA3AF";
const TEXT = "#F2F1ED";
const GREEN = "#34D399";
const AMBER = "#F5A623";
const RED = "#F87171";
const inter = "Inter, sans-serif";
const fraunces = "Fraunces, Georgia, serif";

function qualityColor(q: number | null): string {
  if (q == null) return "#3D434D";
  if (q >= 7) return GREEN;
  if (q >= 5) return AMBER;
  return RED;
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default function SleepTracker({ nights }: { nights: SleepNight[] }) {
  const [openDate, setOpenDate] = useState<string | null>(null);

  const rated = nights.filter((n) => n.quality != null);
  const avg = rated.length ? (rated.reduce((s, n) => s + (n.quality ?? 0), 0) / rated.length).toFixed(1) : "—";
  const poorCount = rated.filter((n) => (n.quality ?? 0) < 5).length;

  // Trend arrow: last 3 vs previous 3.
  const trend = (() => {
    if (rated.length < 4) return null;
    const recent = rated.slice(-3);
    const prev = rated.slice(-6, -3);
    if (prev.length === 0) return null;
    const a = recent.reduce((s, n) => s + (n.quality ?? 0), 0) / recent.length;
    const b = prev.reduce((s, n) => s + (n.quality ?? 0), 0) / prev.length;
    const diff = +(a - b).toFixed(1);
    return diff;
  })();

  const open = nights.find((n) => n.date === openDate) ?? null;

  return (
    <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em" }}>Sleep</p>
        {trend != null && (
          <span style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, color: trend > 0 ? GREEN : trend < 0 ? RED : MUTED }}>
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {trend > 0 ? "+" : ""}{trend} vs last 3
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
        <span style={{ fontFamily: fraunces, fontSize: 40, color: TEXT, fontWeight: 400, lineHeight: 1 }}>{avg}</span>
        <span style={{ fontFamily: inter, fontSize: 13, color: MUTED }}>/ 10 average</span>
      </div>
      <p style={{ fontFamily: inter, fontSize: 11, color: poorCount > 0 ? AMBER : MUTED, marginBottom: 16 }}>
        {rated.length === 0 ? "No sleep logged yet" : poorCount > 0 ? `${poorCount} poor night${poorCount > 1 ? "s" : ""} — tap to see what was different` : "Consistent sleep — nice work"}
      </p>

      {/* Bars — tap to inspect */}
      {nights.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90 }}>
          {nights.map((n) => {
            const q = n.quality ?? 0;
            const active = n.date === openDate;
            const col = qualityColor(n.quality);
            return (
              <button
                key={n.date}
                onClick={() => setOpenDate(active ? null : n.date)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  height: "100%", background: "none", border: "none", padding: 0, cursor: "pointer",
                }}
                aria-label={`${fmtDate(n.date)} — quality ${n.quality ?? "not logged"}`}
              >
                <div style={{
                  width: "100%",
                  height: `${Math.max(6, (q / 10) * 100)}%`,
                  minHeight: 4,
                  borderRadius: 4,
                  background: n.quality == null ? "#20252C" : col,
                  opacity: openDate == null || active ? 1 : 0.4,
                  outline: active ? `2px solid ${TEXT}` : "none",
                  outlineOffset: 1,
                  transition: "opacity 0.15s",
                }} />
              </button>
            );
          })}
        </div>
      )}
      {nights.length > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontFamily: inter, fontSize: 10, color: MUTED }}>{fmtDate(nights[0].date)}</span>
          <span style={{ fontFamily: inter, fontSize: 10, color: MUTED }}>{fmtDate(nights[nights.length - 1].date)}</span>
        </div>
      )}

      {/* Detail for the tapped night */}
      {open && (
        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.03)", borderRadius: 14, border: `1px solid ${BORDER}`, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontFamily: fraunces, fontSize: 16, color: TEXT }}>{fmtDate(open.date)}</p>
            <span style={{
              fontFamily: inter, fontSize: 12, fontWeight: 700, color: qualityColor(open.quality),
              background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "3px 10px",
            }}>
              {open.quality != null ? `${open.quality}/10` : "Not rated"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Duration", value: open.duration != null ? `${open.duration}h` : "—" },
              { label: "Lights out", value: open.bedtime ?? "—" },
              { label: "Woke", value: open.wake ?? "—" },
              { label: "Stress that day", value: open.stress != null ? `${open.stress}/5` : "—" },
              { label: "Energy on waking", value: open.energy != null ? `${open.energy}/5` : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>{label}</p>
                <p style={{ fontFamily: inter, fontSize: 15, color: TEXT, fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>
          {open.notes && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
              <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>What you noted</p>
              <p style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.8)", lineHeight: 1.5, fontStyle: "italic" }}>&ldquo;{open.notes}&rdquo;</p>
            </div>
          )}
          {(open.quality ?? 10) < 5 && (
            <p style={{ fontFamily: inter, fontSize: 11, color: B, marginTop: 12, lineHeight: 1.5 }}>
              Poor night. Compare the numbers above with your good nights — stress, late lights-out or short duration are the usual culprits.
            </p>
          )}
        </div>
      )}

      <a href="/sleep" style={{ display: "inline-block", marginTop: 16, fontFamily: inter, fontSize: 12, color: B, fontWeight: 600 }}>
        Log last night&apos;s sleep →
      </a>
    </div>
  );
}
