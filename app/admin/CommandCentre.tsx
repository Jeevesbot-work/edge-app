"use client";

import { useState } from "react";
import Link from "next/link";

const B = "#C8965A";
const BG = "#0A0A0A";
const SURFACE = "#141414";
const BORDER = "rgba(255,255,255,0.06)";
const MUTED = "#6B7280";
const TEXT = "#F2F1ED";
const fraunces = "Fraunces, Georgia, serif";
const inter = "Inter, sans-serif";

type Tab = "activity" | "members" | "tasks" | "content";

interface Props {
  active: any[];
  pending: any[];
  recentCheckIns: any[];
  recentMessages: any[];
  recentMealLogs: any[];
  tasks: any[];
  contentItems: any[];
  coachNotes: any[];
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommandCentre({ active, pending, recentCheckIns, recentMessages, recentMealLogs, tasks, contentItems, coachNotes }: Props) {
  const [tab, setTab] = useState<Tab>("activity");
  const [newTask, setNewTask] = useState("");
  const [taskList, setTaskList] = useState<any[]>(tasks);
  const [saving, setSaving] = useState(false);

  const activityItems = [
    ...recentCheckIns.map((c) => ({ type: "checkin", name: c.profiles?.full_name ?? "Member", text: `Checked in — Energy ${c.morning_energy}/5, Sleep ${c.sleep_quality}/5`, time: c.created_at, note: c.notes as string | undefined })),
    ...recentMessages.map((m) => ({ type: "message", name: m.profiles?.full_name ?? "Member", text: m.content, time: m.created_at, note: undefined })),
    ...recentMealLogs.map((l) => ({ type: "meal", name: l.profiles?.full_name ?? "Member", text: `Logged meal — ${l.meal_name} · ${l.protein_g}g protein · ${l.calories} kcal`, time: l.created_at, note: undefined })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  async function addTask() {
    if (!newTask.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: newTask.trim() }) });
    const data = await res.json();
    if (res.ok) setTaskList((t) => [...t, data]);
    setNewTask("");
    setSaving(false);
  }

  async function toggleTask(id: string, done: boolean) {
    await fetch("/api/admin/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, done }) });
    setTaskList((t) => t.map((x) => x.id === id ? { ...x, done } : x));
  }

  async function deleteTask(id: string) {
    await fetch("/api/admin/tasks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setTaskList((t) => t.filter((x) => x.id !== id));
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const today = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "activity", label: "Overnight", count: activityItems.length },
    { key: "members", label: "Members", count: active.length },
    { key: "tasks", label: "To-Do", count: taskList.filter((t) => !t.done).length },
    { key: "content", label: "Content", count: contentItems.length },
  ];

  return (
    <div style={{ minHeight: "100svh", background: BG, maxWidth: 680, margin: "0 auto", padding: "0 0 40px" }}>

      {/* Header */}
      <div style={{ padding: "32px 20px 0" }}>
        <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 6 }}>
          {today}
        </p>
        <h1 style={{ fontFamily: fraunces, fontSize: 38, fontWeight: 400, color: TEXT, lineHeight: 1, marginBottom: 6 }}>
          {greeting}, Nick.
        </h1>
        <p style={{ fontFamily: inter, fontSize: 13, color: MUTED, marginBottom: 24 }}>
          {active.length} active · {pending.length > 0 ? `${pending.length} pending approval · ` : ""}{activityItems.length} overnight events
        </p>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <Link href="/admin/add-client" style={{ flex: 1, background: B, borderRadius: 12, padding: "11px 16px", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={BG} strokeWidth={2.5} style={{ width: 16, height: 16, flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span style={{ fontFamily: inter, fontSize: 12, fontWeight: 700, color: BG, textTransform: "uppercase", letterSpacing: "0.12em" }}>Add Client</span>
          </Link>
          <a href="https://app.back2strong.online/preview/barry" style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "11px 16px", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth={1.8} style={{ width: 16, height: 16, flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span style={{ fontFamily: inter, fontSize: 12, fontWeight: 700, color: TEXT, textTransform: "uppercase", letterSpacing: "0.12em" }}>Preview App</span>
          </a>
        </div>

        {/* Pending alert */}
        {pending.length > 0 && (
          <div style={{ background: "rgba(200,150,90,0.08)", border: `1px solid rgba(200,150,90,0.25)`, borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontFamily: inter, fontSize: 11, color: B, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>
                {pending.length} pending approval
              </p>
              <p style={{ fontFamily: inter, fontSize: 12, color: MUTED }}>{pending.map((p) => p.full_name ?? p.email).join(", ")}</p>
            </div>
            <Link href={`/admin/users/${pending[0].id}`} style={{ background: B, color: BG, fontFamily: inter, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 14px", borderRadius: 10, textDecoration: "none" }}>
              Review
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 20px", gap: 6, marginBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "10px 14px 12px",
              fontFamily: inter, fontSize: 12, fontWeight: tab === key ? 700 : 400,
              color: tab === key ? TEXT : MUTED,
              borderBottom: tab === key ? `2px solid ${B}` : "2px solid transparent",
              marginBottom: -1, display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span style={{ background: tab === key ? B : "rgba(255,255,255,0.08)", color: tab === key ? BG : MUTED, fontFamily: inter, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>

        {/* OVERNIGHT ACTIVITY */}
        {tab === "activity" && (
          <div>
            {activityItems.length === 0 ? (
              <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 32, textAlign: "center" }}>
                <p style={{ fontFamily: fraunces, fontSize: 20, color: TEXT, fontWeight: 400, marginBottom: 6 }}>All quiet overnight.</p>
                <p style={{ fontFamily: inter, fontSize: 13, color: MUTED }}>No check-ins, messages or meal logs in the last 10 hours.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activityItems.map((item, i) => (
                  <div key={i} style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                          background: item.type === "checkin" ? "#34D399" : item.type === "meal" ? B : "#60A5FA",
                        }} />
                        <p style={{ fontFamily: inter, fontSize: 12, fontWeight: 700, color: TEXT }}>{item.name}</p>
                        <span style={{ fontFamily: inter, fontSize: 10, color: MUTED, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 99 }}>
                          {item.type === "checkin" ? "Check-in" : item.type === "meal" ? "Meal" : "Message"}
                        </span>
                      </div>
                      <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, flexShrink: 0 }}>{timeAgo(item.time)}</p>
                    </div>
                    <p style={{ fontFamily: inter, fontSize: 13, color: "rgba(242,241,237,0.65)", lineHeight: 1.5, paddingLeft: 15 }}>{item.text}</p>
                    {item.note && <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, fontStyle: "italic", paddingLeft: 15, marginTop: 4 }}>"{item.note}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEMBERS */}
        {tab === "members" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {active.map((p) => (
              <Link key={p.id} href={`/admin/users/${p.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(200,150,90,0.12)", border: `1px solid rgba(200,150,90,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: inter, fontSize: 15, fontWeight: 700, color: B }}>{(p.full_name ?? p.email)[0].toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: inter, fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{p.full_name ?? "Unnamed"}</p>
                    <p style={{ fontFamily: inter, fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2} style={{ width: 16, height: 16, flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
            {active.length === 0 && (
              <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 32, textAlign: "center" }}>
                <p style={{ fontFamily: inter, fontSize: 13, color: MUTED }}>No active members yet.</p>
                <Link href="/admin/add-client" style={{ display: "inline-block", marginTop: 12, background: B, color: BG, fontFamily: inter, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", padding: "10px 20px", borderRadius: 10, textDecoration: "none" }}>
                  Add First Client
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TO-DO */}
        {tab === "tasks" && (
          <div>
            {/* Add task */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a task..."
                style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px", fontFamily: inter, fontSize: 14, color: TEXT, outline: "none" }}
              />
              <button
                onClick={addTask}
                disabled={saving || !newTask.trim()}
                style={{ background: B, border: "none", borderRadius: 12, padding: "0 18px", cursor: "pointer", fontFamily: inter, fontSize: 13, fontWeight: 700, color: BG, opacity: newTask.trim() ? 1 : 0.4 }}
              >
                Add
              </button>
            </div>

            {/* Open tasks */}
            <div style={{ marginBottom: 20 }}>
              {taskList.filter((t) => !t.done).length === 0 && (
                <p style={{ fontFamily: inter, fontSize: 13, color: MUTED, textAlign: "center", padding: "20px 0" }}>No open tasks. You're on top of it.</p>
              )}
              {taskList.filter((t) => !t.done).map((task) => (
                <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <button onClick={() => toggleTask(task.id, true)} style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid rgba(200,150,90,0.4)`, background: "none", cursor: "pointer", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }} />
                  <p style={{ flex: 1, fontFamily: inter, fontSize: 14, color: TEXT, lineHeight: 1.4 }}>{task.text}</p>
                  <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.5} style={{ width: 14, height: 14 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Done tasks */}
            {taskList.filter((t) => t.done).length > 0 && (
              <div>
                <p style={{ fontFamily: inter, fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>Done</p>
                {taskList.filter((t) => t.done).map((task) => (
                  <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${BORDER}`, opacity: 0.45 }}>
                    <button onClick={() => toggleTask(task.id, false)} style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${B}`, background: B, cursor: "pointer", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke={BG} strokeWidth={3} style={{ width: 12, height: 12 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <p style={{ flex: 1, fontFamily: inter, fontSize: 14, color: MUTED, lineHeight: 1.4, textDecoration: "line-through" }}>{task.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENT CALENDAR */}
        {tab === "content" && (
          <div>
            <div style={{ background: "rgba(200,150,90,0.06)", border: `1px solid rgba(200,150,90,0.2)`, borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontFamily: inter, fontSize: 12, color: B, fontWeight: 600, marginBottom: 4 }}>Coming soon</p>
              <p style={{ fontFamily: inter, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                Content calendar is being built. For now, tell me in chat what content you want scheduled and I'll add it here. Planned: post ideas, Instagram hooks, email subjects, publishing dates.
              </p>
            </div>

            {contentItems.length > 0 && contentItems.map((item) => (
              <div key={item.id} style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 16px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: inter, fontSize: 10, color: B, textTransform: "uppercase", letterSpacing: "0.12em" }}>{item.platform}</span>
                  <span style={{ fontFamily: inter, fontSize: 11, color: MUTED }}>{new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </div>
                <p style={{ fontFamily: inter, fontSize: 14, color: TEXT, lineHeight: 1.4 }}>{item.title}</p>
                {item.hook && <p style={{ fontFamily: inter, fontSize: 12, color: MUTED, marginTop: 4 }}>{item.hook}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
