"use client";

import { useState } from "react";
import { BARRY_PROGRAMME } from "@/lib/data/barry-programme";
import { BARRY_PROGRAMME_BLOCK2 } from "@/lib/data/barry-programme-block2";
import { ALEX_GALE_PROGRAMME } from "@/lib/data/alex-gale-programme";
import { RECIPES } from "@/lib/recipes";
import type { Programme } from "@/types";

const B = "#C8A86E";
const BG = "#0E1014";
const SURFACE = "#171B21";
const BORDER = "#252A32";
const MUTED = "#9BA3AF";
const TEXT = "#F2F1ED";
const inter = "Inter, sans-serif";
const fraunces = "Fraunces, Georgia, serif";

const CLIENTS: Record<string, { programme: Programme; name: string }> = {
  barry: { programme: BARRY_PROGRAMME, name: "Barry — Block 1" },
  "barry-b2": { programme: BARRY_PROGRAMME_BLOCK2, name: "Barry — Block 2 Weights" },
  alex: { programme: ALEX_GALE_PROGRAMME, name: "Alex Gale" },
};

type Screen = "train" | "fuel" | "checkin";
type FuelTab = "today" | "cookbook" | "road";

export default function PreviewPage({ params }: { params: { client: string } }) {
  const client = CLIENTS[params.client];
  const [week, setWeek] = useState(1);
  const [screen, setScreen] = useState<Screen>("train");
  const [fuelTab, setFuelTab] = useState<FuelTab>("today");

  if (!client) {
    return (
      <div style={{ padding: 40, fontFamily: inter, color: TEXT, background: BG, minHeight: "100svh" }}>
        <p>Unknown client &quot;{params.client}&quot;. Available: {Object.keys(CLIENTS).join(", ")}</p>
      </div>
    );
  }

  const { programme: prog, name } = client;
  const weekInfo = prog.progression[Math.min(week - 1, prog.progression.length - 1)];

  return (
    <div style={{ minHeight: "100svh", background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 40px" }}>

      {/* Admin header */}
      <div style={{ width: "100%", maxWidth: 420, marginBottom: 16 }}>
        <div style={{ background: "rgba(200,168,110,0.08)", border: "1px solid rgba(200,168,110,0.25)", borderRadius: 14, padding: "14px 18px" }}>
          <p style={{ fontFamily: inter, fontSize: 11, color: B, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>
            PREVIEW — {name}&apos;s app
          </p>
          <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
            {prog.title} · {prog.subtitle} · {prog.lengthWeeks} weeks
          </p>

          {/* Week switcher */}
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: prog.lengthWeeks }, (_, i) => i + 1).map((w) => (
              <button
                key={w}
                onClick={() => setWeek(w)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 10, border: `1px solid ${week === w ? B : "rgba(200,168,110,0.2)"}`,
                  background: week === w ? "rgba(200,168,110,0.15)" : "transparent",
                  fontFamily: inter, fontSize: 11, fontWeight: 700,
                  color: week === w ? B : MUTED, cursor: "pointer",
                }}
              >
                Wk {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Week label */}
      <div style={{ width: "100%", maxWidth: 390, marginBottom: 12 }}>
        <div style={{ background: "rgba(200,168,110,0.06)", border: "1px solid rgba(200,168,110,0.15)", borderRadius: 10, padding: "8px 14px" }}>
          <p style={{ fontFamily: inter, fontSize: 11, color: B, fontWeight: 600 }}>
            Week {week}: {weekInfo.label}
          </p>
          <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>
            {weekInfo.change}
          </p>
        </div>
      </div>

      {/* Phone frame */}
      <div style={{
        width: "100%", maxWidth: 390,
        background: BG,
        borderRadius: 44,
        border: "8px solid #1C1C1E",
        boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px #2C2C2E",
        overflow: "hidden",
        minHeight: 780,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}>

        {/* Status bar */}
        <div style={{ background: BG, padding: "14px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 600, color: TEXT }}>9:41</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <svg width="17" height="12" viewBox="0 0 17 12" fill={TEXT}><rect x="0" y="3" width="3" height="9" rx="1"/><rect x="4.5" y="2" width="3" height="10" rx="1"/><rect x="9" y="0" width="3" height="12" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.3"/></svg>
            <div style={{ width: 25, height: 12, border: `1.5px solid ${TEXT}`, borderRadius: 4, padding: 1.5, display: "flex", alignItems: "center" }}>
              <div style={{ width: "75%", height: "100%", background: TEXT, borderRadius: 2 }}/>
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
          {screen === "train" && <TrainScreen prog={prog} currentWeek={week} weekInfo={weekInfo} />}
          {screen === "fuel" && <FuelScreen prog={prog} tab={fuelTab} setTab={setFuelTab} />}
          {screen === "checkin" && <CheckInScreen prog={prog} />}
        </div>

        {/* Bottom nav */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "rgba(14,16,20,0.95)",
          borderTop: `1px solid ${BORDER}`,
          display: "flex",
          paddingBottom: 20,
          paddingTop: 10,
        }}>
          {([
            { key: "train" as const, label: "Train", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { key: "fuel" as const, label: "Fuel", icon: "M9 3H5a2 2 0 00-2 2v4m6-6h4a2 2 0 012 2v4M9 3v18m0 0h6a2 2 0 002-2v-4M9 21H3a2 2 0 01-2-2v-4m0 0h18" },
            { key: "checkin" as const, label: "Check-in", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          ]).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setScreen(key)}
              style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={screen === key ? B : MUTED} strokeWidth={1.8} style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              <span style={{ fontFamily: inter, fontSize: 10, color: screen === key ? B : MUTED, fontWeight: screen === key ? 600 : 400 }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 390, width: "100%", marginTop: 16 }}>
        <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, textAlign: "center", lineHeight: 1.6 }}>
          Admin preview only — {name} cannot see this page.
          <br />Use the week buttons above to preview any week before assigning.
        </p>
      </div>
    </div>
  );
}

function TrainScreen({ prog, currentWeek, weekInfo }: {
  prog: Programme;
  currentWeek: number;
  weekInfo: Programme["progression"][number];
}) {
  const today = new Date().getDay();
  const DAY_JS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return (
    <div style={{ padding: "16px 20px" }}>
      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 4 }}>
        Preview · Week {currentWeek} of {prog.lengthWeeks}
      </p>
      <h1 style={{ fontFamily: fraunces, fontSize: 36, fontWeight: 400, color: TEXT, lineHeight: 1, marginBottom: 4 }}>Train.</h1>
      <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, marginBottom: 12 }}>
        {prog.title} · {prog.subtitle}
      </p>

      <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
        {Array.from({ length: prog.lengthWeeks }, (_, i) => i + 1).map((w) => (
          <div key={w} style={{ flex: 1, height: 2, borderRadius: 99, background: w <= currentWeek ? B : BORDER, opacity: w === currentWeek ? 1 : 0.5 }} />
        ))}
      </div>

      <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid rgba(200,168,110,0.2)`, padding: 20, marginBottom: 14 }}>
        <p style={{ fontFamily: inter, fontSize: 9, color: B, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4 }}>
          Week {currentWeek} — {weekInfo.label}
        </p>
        <p style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.6)", lineHeight: 1.5, marginBottom: 14 }}>
          {weekInfo.change}
        </p>
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, paddingTop: 12 }}>
          <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
            <span style={{ color: "rgba(242,241,237,0.45)" }}>Rule: </span>{prog.progressionRule}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {prog.weeklySchedule.map(({ day, type }) => {
          const isToday = DAY_JS[day] === today;
          return (
            <div key={day} style={{
              flex: 1, textAlign: "center",
              background: isToday ? "rgba(200,168,110,0.12)" : type === "rest" ? "#0E1014" : SURFACE,
              borderRadius: 10, padding: "8px 2px",
              border: `1px solid ${isToday ? "rgba(200,168,110,0.4)" : BORDER}`,
            }}>
              <p style={{ fontFamily: inter, fontSize: 9, fontWeight: 700, color: isToday ? B : MUTED, letterSpacing: "0.06em" }}>{day}</p>
              <p style={{ fontFamily: inter, fontSize: 8, color: type === "rest" ? "#3D434D" : MUTED, marginTop: 2 }}>
                {type === "rest" ? "off" : type === "cardio" ? "go" : "lift"}
              </p>
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>Sessions</p>

      <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: "18px 20px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 20 }}>🚶</span>
          <div>
            <p style={{ fontFamily: fraunces, fontSize: 17, color: TEXT, fontWeight: 400 }}>{prog.cardio.inclineWalk.label}</p>
            <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, marginTop: 2 }}>{prog.cardio.inclineWalk.days}</p>
          </div>
        </div>
        {"setup" in prog.cardio.inclineWalk && (
          <p style={{ fontFamily: inter, fontSize: 12, color: "rgba(242,241,237,0.6)", marginBottom: 10, lineHeight: 1.5 }}>
            {(prog.cardio.inclineWalk as { setup?: string }).setup}
          </p>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {prog.cardio.inclineWalk.byWeek.map(({ week, duration }) => (
            <div key={week} style={{
              flex: 1, textAlign: "center", padding: "8px 4px",
              background: week === currentWeek ? "rgba(200,168,110,0.1)" : BORDER,
              border: `1px solid ${week === currentWeek ? "rgba(200,168,110,0.3)" : "transparent"}`,
              borderRadius: 10,
            }}>
              <p style={{ fontFamily: inter, fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Wk {week}</p>
              <p style={{ fontFamily: inter, fontSize: 11, color: week === currentWeek ? B : MUTED, fontWeight: week === currentWeek ? 600 : 400 }}>{duration}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 20 }}>🏉</span>
          <div>
            <p style={{ fontFamily: fraunces, fontSize: 17, color: TEXT, fontWeight: 400 }}>{prog.cardio.assaultBike.label}</p>
            <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, marginTop: 2 }}>{prog.cardio.assaultBike.days}</p>
          </div>
        </div>
        {"rule" in prog.cardio.assaultBike && (
          <div style={{ background: "rgba(200,168,110,0.06)", border: "1px solid rgba(200,168,110,0.2)", borderRadius: 10, padding: "8px 12px" }}>
            <p style={{ fontFamily: inter, fontSize: 11, color: "rgba(200,168,110,0.8)" }}>
              {(prog.cardio.assaultBike as { rule?: string }).rule}
            </p>
          </div>
        )}
        {!("rule" in prog.cardio.assaultBike) && (
          <div style={{ display: "flex", gap: 8 }}>
            {prog.cardio.assaultBike.byWeek.map(({ week, format }) => (
              <div key={week} style={{
                flex: 1, textAlign: "center", padding: "8px 4px",
                background: week === currentWeek ? "rgba(200,168,110,0.1)" : BORDER,
                border: `1px solid ${week === currentWeek ? "rgba(200,168,110,0.3)" : "transparent"}`,
                borderRadius: 10,
              }}>
                <p style={{ fontFamily: inter, fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Wk {week}</p>
                <p style={{ fontFamily: inter, fontSize: 10, color: week === currentWeek ? B : MUTED, fontWeight: week === currentWeek ? 600 : 400 }}>{format}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>Nutrition</p>
      <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 20 }}>
        <p style={{ fontFamily: fraunces, fontSize: 16, color: TEXT, fontWeight: 400, lineHeight: 1.45, marginBottom: 14 }}>{prog.nutrition.headline}</p>
        <p style={{ fontFamily: inter, fontSize: 9, color: B, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Targets</p>
        {prog.nutrition.targets.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: B, flexShrink: 0, marginTop: 5 }} />
            <p style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.75)", lineHeight: 1.4 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FuelScreen({ prog, tab, setTab }: { prog: Programme; tab: FuelTab; setTab: (t: FuelTab) => void }) {
  return (
    <div style={{ padding: "16px 20px" }}>
      <h1 style={{ fontFamily: fraunces, fontSize: 36, fontWeight: 400, color: TEXT, lineHeight: 1, marginBottom: 16 }}>Fuel.</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, background: SURFACE, padding: 4, borderRadius: 14 }}>
        {(["today", "cookbook", "road"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
            background: tab === t ? B : "transparent",
            fontFamily: inter, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
            color: tab === t ? BG : MUTED,
          }}>
            {t === "today" ? "Today" : t === "cookbook" ? "Cookbook" : "On the Road"}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Protein", value: "0g", target: `${prog.nutrition.proteinTarget}g target` },
              { label: "Calories", value: "0", target: `${prog.nutrition.calorieTarget.toLocaleString()} target` },
            ].map(({ label, value, target }) => (
              <div key={label} style={{ background: SURFACE, borderRadius: 16, padding: 16, border: `1px solid ${BORDER}` }}>
                <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>{label}</p>
                <p style={{ fontFamily: fraunces, fontSize: 28, color: B, fontWeight: 400, lineHeight: 1 }}>{value}</p>
                <p style={{ fontFamily: inter, fontSize: 10, color: MUTED, marginTop: 4 }}>{target}</p>
                <div style={{ marginTop: 8, height: 3, background: BORDER, borderRadius: 99 }}>
                  <div style={{ width: "0%", height: "100%", background: B, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20, textAlign: "center" }}>
            <p style={{ fontFamily: inter, fontSize: 13, color: MUTED }}>No meals logged yet today.</p>
          </div>
        </div>
      )}

      {tab === "cookbook" && (
        <div>
          <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>
            {RECIPES.length} high-protein recipes
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RECIPES.slice(0, 6).map((r) => (
              <div key={r.id} style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: fraunces, fontSize: 17, color: TEXT, fontWeight: 400, lineHeight: 1.2, marginBottom: 4 }}>{r.title}</p>
                    <p style={{ fontFamily: inter, fontSize: 11, color: MUTED }}>Serves {r.serves} · {r.section}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <p style={{ fontFamily: fraunces, fontSize: 20, color: B, fontWeight: 400 }}>{r.macros_per_serving.protein_g}g</p>
                    <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>protein</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "road" && (
        <div>
          <h2 style={{ fontFamily: fraunces, fontSize: 22, color: TEXT, fontWeight: 400, marginBottom: 16 }}>Fuel On The Road</h2>
          {[
            { label: "Green — Go", color: "#34D399", bg: "rgba(52,211,153,0.06)", border: "rgba(52,211,153,0.2)", items: ["Grilled chicken / steak", "Eggs any style", "Greek yoghurt (plain)", "Protein shake", "Tuna / sardines"] },
            { label: "Amber — Once a day max", color: "#F59E0B", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", items: ["Rice / jacket potato", "Wholegrain bread", "Banana / apple", "Protein bar"] },
            { label: "Red — Avoid", color: "#F87171", bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.2)", items: ["Pastries / croissants", "Crisps / chocolate", "Fizzy drinks", "Fast food", "Alcohol (beyond target)"] },
          ].map(({ label, color, bg, border, items }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12 }}>
              <p style={{ fontFamily: inter, fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>{label}</p>
              {items.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <p style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.8)" }}>{item}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckInScreen({ prog }: { prog: Programme }) {
  return (
    <div style={{ padding: "16px 20px" }}>
      <h1 style={{ fontFamily: fraunces, fontSize: 36, fontWeight: 400, color: TEXT, lineHeight: 1, marginBottom: 6 }}>Check In.</h1>
      <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, marginBottom: 24 }}>{prog.checkIn.frequency}</p>

      <div style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 20, marginBottom: 16 }}>
        <p style={{ fontFamily: inter, fontSize: 9, color: B, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14 }}>Today&apos;s check-in</p>
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
        }}>
          Submit Check-in
        </button>
      </div>
    </div>
  );
}
