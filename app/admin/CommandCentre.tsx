"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const B = "#C8965A";
const BG = "#0A0A0A";
const SURFACE = "#111318";
const SURFACE2 = "#181C22";
const BORDER = "rgba(255,255,255,0.06)";
const MUTED = "#6B7280";
const TEXT = "#F2F1ED";
const fraunces = "Fraunces, Georgia, serif";
const inter = "Inter, sans-serif";

const WATCH_ACCOUNTS = [
  { handle: "@thefitover40man", platform: "Instagram", note: "Performance framing, identity hooks" },
  { handle: "@fitfatherproject", platform: "Instagram", note: "Transformation storytelling, myth-busting" },
  { handle: "@jamessmithpt", platform: "Instagram", note: "Direct delivery, opinion posts = high comments" },
  { handle: "Men Over 40 Fitness", platform: "Facebook", note: "See what resonates in FB feed format" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

interface Props {
  active: Row[];
  pending: Row[];
  recentCheckIns: Row[];
  recentMessages: Row[];
  recentMealLogs: Row[];
  tasks: Row[];
  contentItems: Row[];
  coachNotes: Row[];
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Clock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "right" }}>
      <p style={{ fontFamily: inter, fontSize: 22, fontWeight: 700, color: B, letterSpacing: "0.05em", lineHeight: 1 }}>{time}</p>
      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, letterSpacing: "0.15em", marginTop: 2 }}>{date}</p>
    </div>
  );
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: ok ? "#34D399" : "#F87171" }} />
      <span style={{ fontFamily: inter, fontSize: 10, color: ok ? "#34D399" : "#F87171", fontWeight: 600, letterSpacing: "0.1em" }}>{label}</span>
    </div>
  );
}

export default function CommandCentre({ active, pending, recentCheckIns, recentMessages, recentMealLogs, tasks: initialTasks, coachNotes }: Props) {
  const [tasks, setTasks] = useState<Row[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"HIGH" | "MED" | "LOW">("MED");
  const [saving, setSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<"overview" | "content" | "members">("overview");

  const activityItems = [
    ...recentCheckIns.map((c) => ({ type: "checkin" as const, name: c.profiles?.full_name ?? "Member", text: `Energy ${c.morning_energy}/5 · Sleep ${c.sleep_quality}/5${c.notes ? ` · "${c.notes}"` : ""}`, time: c.created_at })),
    ...recentMessages.map((m) => ({ type: "message" as const, name: m.profiles?.full_name ?? "Member", text: m.content?.slice(0, 120), time: m.created_at })),
    ...recentMealLogs.map((l) => ({ type: "meal" as const, name: l.profiles?.full_name ?? "Member", text: `${l.meal_name} · ${l.protein_g}g protein · ${l.calories} kcal`, time: l.created_at })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  // Featured member = most recently active non-admin
  const clientMembers = active.filter(p => !["n.adams3@icloud.com","nicosmada3@googlemail.com","nick@back2strong.online"].includes(p.email));
  const featuredMember = clientMembers[0];

  async function addTask() {
    if (!newTask.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: newTask.trim(), priority: newTaskPriority }) });
    const data = await res.json();
    if (res.ok) setTasks((t) => [data, ...t]);
    setNewTask("");
    setSaving(false);
  }

  async function toggleTask(id: string, done: boolean) {
    await fetch("/api/admin/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, done }) });
    setTasks((t) => t.map((x) => x.id === id ? { ...x, done } : x));
  }



  const openTasks = tasks.filter((t) => !t.done);
  const priorityColor = (p: string) => p === "HIGH" ? "#F87171" : p === "MED" ? B : MUTED;

  return (
    <div style={{ minHeight: "100svh", background: BG, display: "flex", flexDirection: "column" }}>

      {/* ── Top bar ── */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: B, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: fraunces, fontSize: 13, fontWeight: 700, color: BG }}>B</span>
          </div>
          <div>
            <p style={{ fontFamily: inter, fontSize: 12, fontWeight: 700, color: TEXT, letterSpacing: "0.05em" }}>Back2Strong · Edge</p>
            <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, letterSpacing: "0.15em", textTransform: "uppercase" }}>Command Centre</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <StatusDot ok={true} label="APP ONLINE" />
          <StatusDot ok={true} label="SUPABASE LIVE" />
          <StatusDot ok={pending.length === 0} label={`${pending.length} PENDING`} />
        </div>

        <Clock />
      </div>

      {/* ── Mobile tab switcher ── */}
      <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        {(["overview", "content", "members"] as const).map((t) => (
          <button key={t} onClick={() => setMobileTab(t)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer", padding: "10px 0",
            fontFamily: inter, fontSize: 11, fontWeight: mobileTab === t ? 700 : 400,
            color: mobileTab === t ? B : MUTED, textTransform: "uppercase", letterSpacing: "0.1em",
            borderBottom: mobileTab === t ? `2px solid ${B}` : "2px solid transparent",
          }}>
            {t === "overview" ? "Overview" : t === "content" ? "Content" : "Members"}
          </button>
        ))}
      </div>

      {/* ── Main 3-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 300px", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* ── LEFT: Members ── */}
        <div style={{ borderRight: `1px solid ${BORDER}`, overflowY: "auto", padding: "16px 14px" }}>
          <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Members</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div style={{ background: SURFACE2, borderRadius: 10, padding: "12px", textAlign: "center" }}>
              <p style={{ fontFamily: fraunces, fontSize: 32, color: "#34D399", fontWeight: 400, lineHeight: 1 }}>{clientMembers.length}</p>
              <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>Active</p>
            </div>
            <div style={{ background: SURFACE2, borderRadius: 10, padding: "12px", textAlign: "center" }}>
              <p style={{ fontFamily: fraunces, fontSize: 32, color: pending.length > 0 ? B : MUTED, fontWeight: 400, lineHeight: 1 }}>{pending.length}</p>
              <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>Pending</p>
            </div>
          </div>

          {/* Featured member */}
          {featuredMember && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: inter, fontSize: 9, color: B, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>{featuredMember.full_name?.split(" ")[0]?.toUpperCase()}</p>
              <Link href={`/admin/users/${featuredMember.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: SURFACE2, borderRadius: 12, padding: "12px", border: `1px solid rgba(200,150,90,0.2)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(200,150,90,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 700, color: B }}>{(featuredMember.full_name ?? featuredMember.email)[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: TEXT }}>{featuredMember.full_name}</p>
                      <p style={{ fontFamily: inter, fontSize: 10, color: MUTED }}>{featuredMember.email}</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div>
                      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>Last sign in</p>
                      <p style={{ fontFamily: inter, fontSize: 11, color: TEXT, marginTop: 1 }}>—</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>Sessions</p>
                      <p style={{ fontFamily: inter, fontSize: 11, color: TEXT, marginTop: 1 }}>0</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Member list */}
          <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>Active Members</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
            {clientMembers.map((p) => (
              <Link key={p.id} href={`/admin/users/${p.id}`} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, background: SURFACE2 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(200,150,90,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: inter, fontSize: 11, fontWeight: 700, color: B }}>{(p.full_name ?? p.email)[0].toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: TEXT }}>{p.full_name ?? "Unnamed"}</p>
                    <p style={{ fontFamily: inter, fontSize: 10, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2} style={{ width: 12, height: 12, flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
            <Link href="/admin/add-client" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 10, border: `1px dashed rgba(200,150,90,0.25)`, marginTop: 4 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth={2} style={{ width: 14, height: 14 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span style={{ fontFamily: inter, fontSize: 11, color: B, fontWeight: 600 }}>Add New Client</span>
            </Link>
          </div>

          {/* Watch accounts */}
          <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>Watch Accounts</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {WATCH_ACCOUNTS.map((a) => (
              <div key={a.handle} style={{ background: SURFACE2, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <p style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: B }}>{a.handle}</p>
                  <span style={{ fontFamily: inter, fontSize: 9, color: MUTED, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>{a.platform.toUpperCase()}</span>
                </div>
                <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, lineHeight: 1.4 }}>{a.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTRE: Content ── */}
        <div style={{ overflowY: "auto", padding: "16px 20px" }}>

          {/* Today's post */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em" }}>Today's Post</p>
              <Link href="/admin/content" style={{ fontFamily: inter, fontSize: 10, color: B, textDecoration: "none" }}>Edit →</Link>
            </div>
            <div style={{ background: SURFACE2, borderRadius: 14, border: `1px solid rgba(200,150,90,0.15)`, padding: "18px 20px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: inter, fontSize: 10, fontWeight: 700, color: TEXT, background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>REEL</span>
                <span style={{ fontFamily: inter, fontSize: 10, color: MUTED, padding: "4px 10px" }}>Instagram</span>
              </div>
              {[
                { letter: "H", label: "Hook", text: "If you're 40+ and you've stopped believing you can still build real muscle — watch this." },
                { letter: "I", label: "Intrigue", text: "I used to train men who'd written themselves off. Said their body was done. They weren't. They just needed someone to stop lying to them." },
                { letter: "D", label: "Delivery", text: "Here's what actually changes when you train with intent over 40: recovery improves within 2 weeks of consistent protein. Strength comes back faster than you think. Your nervous system remembers." },
                { letter: "E", label: "Exit", text: "Save this. Share it with someone who needs to hear it." },
              ].map(({ letter, label, text }) => (
                <div key={letter} style={{ marginBottom: 12 }}>
                  <p style={{ fontFamily: inter, fontSize: 10, fontWeight: 700, color: B, marginBottom: 4 }}>{letter} — {label}</p>
                  <p style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.75)", lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content calendar */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Content Calendar</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { day: "MON", title: "Everything you've been told about training over 40 is slowing you down.", type: "MYTH BUST", platform: "INSTAGRAM", status: "READY" },
                { day: "WED", title: "I trained wrong for years. Here's what I wish someone had told me at 40.", type: "PERSONAL STORY", platform: "INSTAGRAM + FACEBOOK", status: "READY" },
                { day: "FRI", title: "The reason you're not recovering between sessions has nothing to do with age.", type: "PRACTICAL TIP", platform: "INSTAGRAM", status: "READY" },
                { day: "MON", title: "Most men over 40 are training to survive. You should be training to dominate.", type: "DIRECT CHALLENGE", platform: "INSTAGRAM", status: "DRAFT" },
              ].map((item, i) => (
                <div key={i} style={{ background: SURFACE2, borderRadius: 12, padding: "14px 16px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 36, flexShrink: 0, textAlign: "center" }}>
                    <p style={{ fontFamily: inter, fontSize: 10, fontWeight: 700, color: B, textTransform: "uppercase" }}>{item.day}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: inter, fontSize: 13, color: TEXT, lineHeight: 1.4, marginBottom: 4 }}>{item.title}</p>
                    <p style={{ fontFamily: inter, fontSize: 10, color: MUTED }}>{item.type} · {item.platform}</p>
                  </div>
                  <span style={{
                    fontFamily: inter, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                    padding: "4px 10px", borderRadius: 6, flexShrink: 0,
                    background: item.status === "READY" ? "rgba(52,211,153,0.1)" : "rgba(107,114,128,0.15)",
                    color: item.status === "READY" ? "#34D399" : MUTED,
                    border: `1px solid ${item.status === "READY" ? "rgba(52,211,153,0.3)" : BORDER}`,
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Accounts to study */}
          <div>
            <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Accounts to Study this Week</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { handle: "@thefitover40man", followers: "387K", note: "Performance framing, identity hooks" },
                { handle: "@fitfatherproject", followers: "57K", note: "Transformation storytelling, myth-busting" },
                { handle: "@jamessmithpt", followers: "2M+", note: "Direct delivery, opinion posts = high comments" },
                { handle: "Men Over 40 Fitness", followers: "—", note: "See what resonates in FB feed format" },
              ].map((a) => (
                <div key={a.handle} style={{ background: SURFACE2, borderRadius: 12, padding: "14px 16px", border: `1px solid ${BORDER}` }}>
                  <p style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: B, marginBottom: 3 }}>{a.handle}</p>
                  <p style={{ fontFamily: inter, fontSize: 10, color: MUTED, marginBottom: 6 }}>{a.followers} followers</p>
                  <p style={{ fontFamily: inter, fontSize: 11, color: "rgba(242,241,237,0.55)", lineHeight: 1.4 }}>{a.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Actions + Notes + Activity ── */}
        <div style={{ borderLeft: `1px solid ${BORDER}`, overflowY: "auto", padding: "16px 14px" }}>

          {/* Action items */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Action Items</p>

            {/* Add task */}
            <div style={{ marginBottom: 10 }}>
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add action item..."
                style={{ width: "100%", background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", fontFamily: inter, fontSize: 12, color: TEXT, outline: "none", boxSizing: "border-box", marginBottom: 6 }}
              />
              <div style={{ display: "flex", gap: 4 }}>
                {(["HIGH", "MED", "LOW"] as const).map((p) => (
                  <button key={p} onClick={() => setNewTaskPriority(p)} style={{
                    flex: 1, padding: "5px 0", borderRadius: 6, border: `1px solid ${newTaskPriority === p ? priorityColor(p) : BORDER}`,
                    background: newTaskPriority === p ? `${priorityColor(p)}15` : "none", cursor: "pointer",
                    fontFamily: inter, fontSize: 9, fontWeight: 700, color: newTaskPriority === p ? priorityColor(p) : MUTED,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>{p}</button>
                ))}
                <button onClick={addTask} disabled={!newTask.trim() || saving} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: newTask.trim() ? B : SURFACE2, cursor: "pointer", fontFamily: inter, fontSize: 9, fontWeight: 700, color: newTask.trim() ? BG : MUTED }}>
                  ADD
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {openTasks.length === 0 && <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, textAlign: "center", padding: "8px 0" }}>No open actions.</p>}
              {openTasks.map((task) => (
                <div key={task.id} style={{ background: SURFACE2, borderRadius: 10, padding: "11px 12px", border: `1px solid ${BORDER}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: inter, fontSize: 8, fontWeight: 700, color: priorityColor(task.priority ?? "MED"), background: `${priorityColor(task.priority ?? "MED")}15`, padding: "3px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1 }}>
                    {task.priority ?? "MED"}
                  </span>
                  <p style={{ flex: 1, fontFamily: inter, fontSize: 12, color: TEXT, lineHeight: 1.4 }}>{task.text}</p>
                  <button onClick={() => toggleTask(task.id, true)} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 2 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid rgba(200,150,90,0.4)` }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes from Claude */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Notes from Claude</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { date: "08 Jun", text: "Dashboard live. Data updates in real-time from Supabase. Add tasks via the input above." },
                { date: "08 Jun", text: "Barry is set up and approved in Supabase. programme_state created at Day 1, Week 1. If he hasn't logged in by Thu, use Resend Link in admin panel." },
              ].map((note, i) => (
                <div key={i} style={{ background: SURFACE2, borderRadius: 10, padding: "11px 12px", border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "center" }}>
                    <span style={{ fontFamily: inter, fontSize: 9, fontWeight: 700, color: B, letterSpacing: "0.1em" }}>CLAUDE</span>
                    <span style={{ fontFamily: inter, fontSize: 9, color: MUTED }}>· {note.date}</span>
                  </div>
                  <p style={{ fontFamily: inter, fontSize: 11, color: "rgba(242,241,237,0.65)", lineHeight: 1.5 }}>{note.text}</p>
                </div>
              ))}
              {coachNotes.map((n) => (
                <div key={n.id} style={{ background: SURFACE2, borderRadius: 10, padding: "11px 12px", border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "center" }}>
                    <span style={{ fontFamily: inter, fontSize: 9, fontWeight: 700, color: B, letterSpacing: "0.1em" }}>CLAUDE</span>
                    <span style={{ fontFamily: inter, fontSize: 9, color: MUTED }}>· {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  </div>
                  <p style={{ fontFamily: inter, fontSize: 11, color: "rgba(242,241,237,0.65)", lineHeight: 1.5 }}>{n.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent check-ins */}
          <div>
            <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Recent Check-ins</p>
            {activityItems.length === 0 ? (
              <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, textAlign: "center", padding: "12px 0" }}>No check-ins yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activityItems.map((item, i) => (
                  <div key={i} style={{ background: SURFACE2, borderRadius: 10, padding: "10px 12px", border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.type === "checkin" ? "#34D399" : item.type === "meal" ? B : "#60A5FA", flexShrink: 0 }} />
                        <p style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, color: TEXT }}>{item.name}</p>
                      </div>
                      <p style={{ fontFamily: inter, fontSize: 10, color: MUTED }}>{timeAgo(item.time)}</p>
                    </div>
                    <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, lineHeight: 1.4, paddingLeft: 12 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: SURFACE, padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <p style={{ fontFamily: inter, fontSize: 9, color: MUTED, letterSpacing: "0.1em" }}>BACK2STRONG · EDGE COMMAND CENTRE</p>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="https://app.back2strong.online" style={{ fontFamily: inter, fontSize: 9, color: MUTED, textDecoration: "none" }}>CLIENT APP</a>
          <a href="https://back2strong.online" style={{ fontFamily: inter, fontSize: 9, color: MUTED, textDecoration: "none" }}>WEBSITE</a>
          <a href="https://app.back2strong.online/preview/barry" style={{ fontFamily: inter, fontSize: 9, color: MUTED, textDecoration: "none" }}>PREVIEW</a>
        </div>
      </div>
    </div>
  );
}
