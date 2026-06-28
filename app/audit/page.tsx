"use client";

import { useState } from "react";

const B = "#C8965A";
const BG = "#0A0A0A";
const SURFACE = "#111318";
const MUTED = "#6B7280";
const TEXT = "#F2F1ED";

type FormData = {
  // Contact
  full_name: string;
  email: string;
  phone: string;
  // S2: Performance Snapshot
  age: string;
  height: string;
  weight: string;
  waist: string;
  resting_hr: string;
  avg_sleep: string;
  alcohol_nights: string;
  training_days: string;
  structured_program: string;
  bloodwork: string;
  pushups: string;
  hang: string;
  floor: string;
  steps: string;
  // S3: Energy & Recovery
  morning_energy: number;
  afternoon_energy: number;
  motivation: number;
  sleep_quality: number;
  recovery: number;
  stress: number;
  libido: number;
  // S4: Time & Priority
  screen_time: string;
  tv_hours: string;
  social_scroll: string;
  wake_time: string;
  bed_time: string;
  health_priority: number;
  barriers: string[];
  // S5: Age Narrative
  age_limitations: string;
  habit_or_age: string;
  // S6: Commitment
  committed: string;
  // S7: 60-Year-Old Test
  decade_projection: string;
  ninety_day_goal: string;
};

const EMPTY: FormData = {
  full_name: "", email: "", phone: "",
  age: "", height: "", weight: "", waist: "", resting_hr: "", avg_sleep: "", alcohol_nights: "", training_days: "",
  structured_program: "", bloodwork: "", pushups: "", hang: "", floor: "", steps: "",
  morning_energy: 3, afternoon_energy: 3, motivation: 3, sleep_quality: 3, recovery: 3, stress: 3, libido: 3,
  screen_time: "", tv_hours: "", social_scroll: "", wake_time: "", bed_time: "", health_priority: 5,
  barriers: [],
  age_limitations: "", habit_or_age: "",
  committed: "",
  decade_projection: "", ninety_day_goal: "",
};

const BARRIERS = ["Time structure", "Energy", "Travel", "Injury", "Motivation", "Family demands", "Work demands", "Medical issue", "Other"];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: 13, color: TEXT, marginBottom: 6, fontWeight: 500 }}>
      {children}{required && <span style={{ color: B, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", background: "#1A1F28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
        padding: "10px 14px", color: TEXT, fontFamily: "Inter, sans-serif", fontSize: 14,
        outline: "none", boxSizing: "border-box",
      }}
    />
  );
}

function YesNo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {["Yes", "No"].map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: "6px 20px", borderRadius: 6, border: `1px solid ${value === opt ? B : "rgba(255,255,255,0.15)"}`,
          background: value === opt ? "rgba(200,150,90,0.15)" : "transparent",
          color: value === opt ? B : MUTED, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>{opt}</button>
      ))}
    </div>
  );
}

function Slider({ value, onChange, min = 1, max = 5, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TEXT }}>{label}</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B, fontWeight: 700 }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: B }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: MUTED }}>{min}</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: MUTED }}>{max}</span>
      </div>
    </div>
  );
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
      style={{
        width: "100%", background: "#1A1F28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
        padding: "10px 14px", color: TEXT, fontFamily: "Inter, sans-serif", fontSize: 14,
        outline: "none", resize: "vertical", boxSizing: "border-box",
      }} />
  );
}

export default function AuditPage() {
  const [section, setSection] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setData(d => ({ ...d, [key]: val }));
  }

  function toggleBarrier(b: string) {
    setData(d => ({
      ...d,
      barriers: d.barriers.includes(b) ? d.barriers.filter(x => x !== b) : [...d.barriers, b],
    }));
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      setDone(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  const avgEnergy = ((data.morning_energy + data.afternoon_energy + data.motivation + data.sleep_quality + data.recovery + data.stress + data.libido) / 7).toFixed(1);

  const field = (key: keyof FormData, label: string, placeholder?: string, required?: boolean) => (
    <div style={{ marginBottom: 16 }}>
      <Label required={required}>{label}</Label>
      <Input value={data[key] as string} onChange={v => set(key, v as FormData[typeof key])} placeholder={placeholder} />
    </div>
  );

  const sections = [
    // 0 — Intro
    <div key="intro">
      <div style={{ marginBottom: 8, fontFamily: "Inter, sans-serif", fontSize: 11, color: B, letterSpacing: "0.2em", textTransform: "uppercase" }}>Performance Audit</div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 400, color: TEXT, marginBottom: 8, lineHeight: 1.1 }}>Strong 90</h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: MUTED, marginBottom: 32 }}>Midlife Performance Reset Audit</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, color: MUTED, fontFamily: "Inter, sans-serif", fontSize: 13 }}>
        <span>⏱</span><span>Estimated completion: 20 minutes</span>
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: TEXT, lineHeight: 1.7, marginBottom: 12 }}>
        You are not here because you&apos;re failing.<br />
        <strong>You&apos;re here because you know you&apos;re capable of more.</strong>
      </p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 40 }}>
        This audit helps us identify where momentum has slowed and where we rebuild it first. This is not about judgment. It&apos;s about direction.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48, maxWidth: 340 }}>
        {[["7 sections", "Short answers & sliders"], ["Takes about 20 minutes", "Reviewed personally within 48h"]].map(([a, b]) => (
          <div key={a}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TEXT, marginBottom: 4 }}>· {a}</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TEXT }}>· {b}</p>
          </div>
        ))}
      </div>
    </div>,

    // 1 — Contact
    <div key="s1">
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: B, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Section 1 of 7</div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 4 }}>Your Details</h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: MUTED, marginBottom: 24 }}>So Nick can review and respond to you personally.</p>
      {field("full_name", "Full name", "Your name", true)}
      {field("email", "Email address", "you@example.com", true)}
      {field("phone", "Phone / WhatsApp", "Optional — for follow-up")}
    </div>,

    // 2 — Performance Snapshot
    <div key="s2">
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: B, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Section 2 of 7</div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 4 }}>Current Performance Snapshot</h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: MUTED, marginBottom: 24 }}>Honest numbers, no judgment.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 4 }}>
        <div><Label required>Age</Label><Input value={data.age} onChange={v => set("age", v)} placeholder="Years" /></div>
        <div><Label>Height</Label><Input value={data.height} onChange={v => set("height", v)} placeholder="e.g. 5'11" /></div>
        <div><Label>Weight</Label><Input value={data.weight} onChange={v => set("weight", v)} placeholder="lbs or kg" /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div><Label>Waist at navel (inches)</Label><Input value={data.waist} onChange={v => set("waist", v)} placeholder="inches" /></div>
        <div><Label>Resting heart rate</Label><Input value={data.resting_hr} onChange={v => set("resting_hr", v)} placeholder="bpm" /></div>
        <div><Label required>Avg nightly sleep</Label><Input value={data.avg_sleep} onChange={v => set("avg_sleep", v)} placeholder="hours" /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div><Label>Alcohol nights/week</Label><Input value={data.alcohol_nights} onChange={v => set("alcohol_nights", v)} placeholder="nights" /></div>
        <div><Label>Training days/week</Label><Input value={data.training_days} onChange={v => set("training_days", v)} placeholder="days (last 4 weeks avg)" /></div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, marginBottom: 20 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>Program & Health</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TEXT }}>Are you currently following a structured program?</span>
          <YesNo value={data.structured_program} onChange={v => set("structured_program", v)} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TEXT }}>Have you had bloodwork done in the last 18 months?</span>
          <YesNo value={data.bloodwork} onChange={v => set("bloodwork", v)} />
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>Functional Markers</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: MUTED, marginBottom: 16 }}>Answer honestly — these establish your starting point, not your worth.</p>
        {[
          ["pushups", "Can you perform 10 strict push-ups?"],
          ["hang", "Can you hang from a bar for 30 seconds?"],
          ["floor", "Can you get up from the floor without using your hands?"],
          ["steps", "Can you walk 10,000 steps comfortably?"],
        ].map(([key, label]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TEXT }}>{label}</span>
            <YesNo value={data[key as keyof FormData] as string} onChange={v => set(key as keyof FormData, v as never)} />
          </div>
        ))}
      </div>
    </div>,

    // 3 — Energy & Recovery
    <div key="s3">
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: B, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Section 3 of 7</div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 4 }}>Energy & Recovery Screen</h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: MUTED, marginBottom: 24 }}>Rate each on a scale of 1 to 5.</p>
      <div style={{ background: SURFACE, borderRadius: 12, padding: "20px 20px 4px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em" }}>Rating Scale</span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: MUTED }}>1 = Poor · 5 = Excellent</span>
        </div>
        <Slider value={data.morning_energy} onChange={v => set("morning_energy", v)} label="Morning energy" />
        <Slider value={data.afternoon_energy} onChange={v => set("afternoon_energy", v)} label="Afternoon energy stability" />
        <Slider value={data.motivation} onChange={v => set("motivation", v)} label="Motivation to train" />
        <Slider value={data.sleep_quality} onChange={v => set("sleep_quality", v)} label="Sleep quality" />
        <Slider value={data.recovery} onChange={v => set("recovery", v)} label="Recovery between sessions" />
        <Slider value={data.stress} onChange={v => set("stress", v)} label="Stress management" />
        <Slider value={data.libido} onChange={v => set("libido", v)} label="Libido" />
      </div>
      <div style={{ background: "rgba(200,150,90,0.08)", border: "1px solid rgba(200,150,90,0.2)", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TEXT }}>Your average energy score</p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B }}>
            {Number(avgEnergy) >= 4 ? "Strong foundation" : Number(avgEnergy) >= 3 ? "Solid foundation to build from" : "Clear room to rebuild"}
          </p>
        </div>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 32, color: B, fontWeight: 400 }}>{avgEnergy}</p>
      </div>
    </div>,

    // 4 — Time & Priority
    <div key="s4">
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: B, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Section 4 of 7</div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 4 }}>Time & Priority Snapshot</h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: MUTED, marginBottom: 24 }}>Understanding how you live helps us understand how to rebuild.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><Label>Avg daily screen time</Label><Input value={data.screen_time} onChange={v => set("screen_time", v)} placeholder="e.g. 4 hours" /></div>
        <div><Label>TV hours per week</Label><Input value={data.tv_hours} onChange={v => set("tv_hours", v)} placeholder="hours" /></div>
        <div><Label>Social media scroll (mins/day)</Label><Input value={data.social_scroll} onChange={v => set("social_scroll", v)} placeholder="mins" /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div><Label>Wake time</Label><Input value={data.wake_time} onChange={v => set("wake_time", v)} placeholder="e.g. 6:30am" /></div>
        <div><Label>Bed time</Label><Input value={data.bed_time} onChange={v => set("bed_time", v)} placeholder="e.g. 11:00pm" /></div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Label>On a scale of 1–10, where does your health currently rank in your priorities?</Label>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: B, fontWeight: 700 }}>{data.health_priority} / 10</span>
        </div>
        <input type="range" min={1} max={10} value={data.health_priority} onChange={e => set("health_priority", Number(e.target.value))}
          style={{ width: "100%", accentColor: B }} />
      </div>
      <div>
        <Label>What realistically makes training difficult?</Label>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: MUTED, marginBottom: 12 }}>Select all that apply</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {BARRIERS.map(b => (
            <button key={b} onClick={() => toggleBarrier(b)} style={{
              padding: "7px 14px", borderRadius: 20, border: `1px solid ${data.barriers.includes(b) ? B : "rgba(255,255,255,0.15)"}`,
              background: data.barriers.includes(b) ? "rgba(200,150,90,0.15)" : "transparent",
              color: data.barriers.includes(b) ? B : MUTED, fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer",
            }}>{b}</button>
          ))}
        </div>
      </div>
    </div>,

    // 5 — Age Narrative
    <div key="s5">
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: B, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Section 5 of 7</div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 4 }}>Age Narrative Check</h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: MUTED, marginBottom: 20 }}>This section matters more than most people realise.</p>
      <div style={{ background: SURFACE, borderRadius: 10, padding: "16px 18px", marginBottom: 24, borderLeft: "3px solid rgba(200,150,90,0.3)" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: MUTED, lineHeight: 1.7, fontStyle: "italic" }}>
          Many limitations attributed to aging are the result of accumulated habits — insufficient movement, poor recovery, and gradual disengagement. This is not always the case, but it is more often than assumed.
        </p>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Label required>What physical limitations have you recently blamed on age?</Label>
        <Textarea value={data.age_limitations} onChange={v => set("age_limitations", v)} placeholder="Joint pain, slower recovery, less energy, lower drive..." />
      </div>
      <div>
        <Label required>Are you certain these are age-related — or could they be habit-related?</Label>
        <Textarea value={data.habit_or_age} onChange={v => set("habit_or_age", v)} placeholder="Be honest with yourself here. There is no wrong answer." />
      </div>
    </div>,

    // 6 — Commitment Standard
    <div key="s6">
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: B, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Section 6 of 7</div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 4 }}>Strong 90 Commitment Standard</h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: MUTED, marginBottom: 24 }}>Before we proceed, clarity on what this requires.</p>
      <div style={{ background: "rgba(200,150,90,0.08)", border: "1px solid rgba(200,150,90,0.25)", borderRadius: 12, padding: "20px 22px", marginBottom: 28 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B, fontWeight: 600, marginBottom: 16 }}>For the next 90 days, Strong 90 requires the following minimum standards:</p>
        {[
          "3 structured training sessions per week",
          "7-hour sleep window",
          "Daily protein target",
          "Alcohol maximum 2 nights per week",
          "Weekly accountability check-in",
        ].map(s => (
          <div key={s} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: B, fontSize: 16 }}>✓</span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TEXT }}>{s}</span>
          </div>
        ))}
      </div>
      <div>
        <Label required>Are you prepared to commit to these standards?</Label>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {["Yes", "Not Yet"].map(opt => (
            <button key={opt} onClick={() => set("committed", opt)} style={{
              padding: "8px 24px", borderRadius: 8, border: `1px solid ${data.committed === opt ? B : "rgba(255,255,255,0.15)"}`,
              background: data.committed === opt ? "rgba(200,150,90,0.15)" : "transparent",
              color: data.committed === opt ? B : MUTED, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{opt}</button>
          ))}
        </div>
      </div>
    </div>,

    // 7 — 60-Year-Old Test
    <div key="s7">
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: B, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Section 7 of 7</div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 4 }}>The 60-Year-Old Test</h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: MUTED, marginBottom: 20 }}>Project forward. What does the trajectory reveal?</p>
      <div style={{ background: SURFACE, borderRadius: 10, padding: "16px 18px", marginBottom: 28, borderLeft: "3px solid rgba(200,150,90,0.3)" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: MUTED, lineHeight: 1.7, fontStyle: "italic" }}>
          The clearest way to understand where you&apos;re headed is to project your current habits and patterns forward — not with fear, but with clarity.
        </p>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Label required>If I continue as I am for the next decade, I will become a man who ______.</Label>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: MUTED, marginBottom: 8 }}>Complete the sentence honestly.</p>
        <Textarea value={data.decade_projection} onChange={v => set("decade_projection", v)} placeholder="...is too tired to be present. ...has accepted decline. ...or something else entirely." />
      </div>
      <div>
        <Label required>In 90 days, I want to feel ______.</Label>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: MUTED, marginBottom: 8 }}>Complete the sentence. Be specific.</p>
        <Textarea value={data.ninety_day_goal} onChange={v => set("ninety_day_goal", v)} placeholder="Strong, capable, clear-headed, back in control..." />
      </div>
      {error && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#F87171", marginTop: 16 }}>{error}</p>}
    </div>,
  ];

  const total = sections.length;
  const isLast = section === total - 1;
  const isIntro = section === 0;

  if (done) {
    return (
      <div style={{ minHeight: "100svh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${B}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 28, color: B }}>✓</span>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: TEXT, lineHeight: 1.7, maxWidth: 360, marginBottom: 12 }}>
          Strong 90 is about rebuilding momentum — not chasing perfection.
        </p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: MUTED, lineHeight: 1.7, maxWidth: 360, marginBottom: 48 }}>
          I will personally review your responses and respond within 48 hours with your starting point and first focus area.
        </p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: MUTED, letterSpacing: "0.2em", textTransform: "uppercase" }}>Strong 90 · Midlife Performance Reset</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100svh", background: BG, display: "flex", flexDirection: "column" }}>
      {/* Progress bar */}
      {!isIntro && (
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ height: "100%", background: B, width: `${((section) / (total - 1)) * 100}%`, transition: "width 0.3s" }} />
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "40px 24px 120px", maxWidth: 560, margin: "0 auto", width: "100%" }}>
        {!isIntro && (
          <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
            {Array.from({ length: total - 1 }, (_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < section ? B : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        )}
        {sections[section]}
      </div>

      {/* Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: BG, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {section > 0 ? (
          <button onClick={() => setSection(s => s - 1)} style={{ background: "none", border: "none", color: MUTED, fontFamily: "Inter, sans-serif", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            ← Back
          </button>
        ) : <div />}

        {isLast ? (
          <button onClick={submit} disabled={submitting} style={{
            background: B, color: BG, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700,
            padding: "12px 28px", borderRadius: 10, border: "none", cursor: submitting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8, opacity: submitting ? 0.7 : 1,
          }}>
            {submitting ? "Submitting..." : "Submit Audit"} →
          </button>
        ) : (
          <button onClick={() => setSection(s => s + 1)} style={{
            background: isIntro ? B : "transparent", color: isIntro ? BG : TEXT,
            fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700,
            padding: "12px 28px", borderRadius: 10,
            border: isIntro ? "none" : `1px solid rgba(255,255,255,0.2)`,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          }}>
            {isIntro ? "Begin Audit" : "Continue"} →
          </button>
        )}
      </div>
    </div>
  );
}
