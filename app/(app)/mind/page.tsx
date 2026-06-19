"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { LESSONS } from "@/lib/data/lessons";

const AUDIO_LESSONS = [
  { id: 1, title: "Identity Beats Motivation", duration: "12 min", category: "Identity", file: "/audio/identity-beats-motivation.mp3" },
  { id: 2, title: "Why Midlife Feels Different", duration: "14 min", category: "Mindset", file: "/audio/why-midlife-feels-different.mp3" },
  { id: 3, title: "The Back2Strong Code", duration: "10 min", category: "Identity", file: "/audio/back2strong-code.mp3" },
  { id: 4, title: "Post-40 Playbook", duration: "18 min", category: "Training", file: "/audio/40-plus-playbook.mp3" },
  { id: 5, title: "Consistency Over Intensity", duration: "11 min", category: "Training", file: "/audio/training-after-40.mp3" },
  { id: 6, title: "Maximize Recovery", duration: "13 min", category: "Recovery", file: "/audio/maximize-recovery.mp3" },
  { id: 7, title: "The STRONG Operating System", duration: "15 min", category: "Mindset", file: "/audio/strong-operating-system.mp3" },
];

const BREATHWORK = [
  { id: "box", name: "Box Breathing", subtitle: "Stress control · focus", duration: "64 sec" },
  { id: "478", name: "4-7-8 Breathing", subtitle: "Relaxation · sleep", duration: "76 sec" },
  { id: "power", name: "Power Breathing", subtitle: "Energy · clarity", duration: "60 sec" },
];

const PHASES = [
  { code: "S", name: "Self-Confrontation", days: [1, 2, 3, 4, 5] },
  { code: "T", name: "Truth Mapping", days: [6, 7, 8, 9, 10] },
  { code: "R", name: "Reflective Evolution", days: [11, 12, 13, 14, 15] },
  { code: "O", name: "Ownership Routines", days: [16, 17, 18, 19, 20] },
  { code: "N", name: "Non-Negotiables", days: [21, 22, 23, 24, 25] },
  { code: "G", name: "Growth Loops", days: [26, 27, 28, 29, 30] },
];

function AudioPlayer({ lesson }: { lesson: typeof AUDIO_LESSONS[0] }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  }

  function onTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  }

  return (
    <div style={{ background: "#171B21", borderRadius: 16, padding: "14px 16px", border: "1px solid #252A32" }}>
      <audio ref={audioRef} src={lesson.file} onTimeUpdate={onTimeUpdate} onEnded={() => { setPlaying(false); setProgress(0); }} preload="none" />
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={toggle}
          style={{ width: 44, height: 44, borderRadius: "50%", background: playing ? "rgba(200,150,90,0.15)" : "#C8965A", border: playing ? "1px solid rgba(200,150,90,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16, color: "#C8965A" }}>
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16, color: "#0E1014", marginLeft: 2 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 15, color: "#F2F1ED", fontWeight: 400, lineHeight: 1.2, marginBottom: 2 }}>
            {lesson.title}
          </p>
          <p style={{ fontSize: 10, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginBottom: 8 }}>
            {lesson.duration} · {lesson.category}
          </p>
          <div style={{ height: 2, background: "#252A32", borderRadius: 99, cursor: "pointer" }} onClick={seek}>
            <div style={{ height: "100%", background: "#C8965A", borderRadius: 99, width: `${progress}%`, transition: "width 0.1s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MindPage() {
  const currentDay = 1;
  const today = LESSONS.find((l) => l.day === currentDay);

  return (
    <div className="max-w-lg mx-auto px-5 pb-8" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 16px)" }}>

      {/* Header */}
      <div style={{ paddingTop: 8, paddingBottom: 20 }}>
        <p style={{ fontSize: 9, color: "#9BA3AF", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "Inter, sans-serif", marginBottom: 4 }}>
          The STRONG System
        </p>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 36, fontWeight: 400, color: "#F2F1ED", lineHeight: 1 }}>
          Mind.
        </h1>
      </div>

      {/* Today's lesson */}
      {today && (
        <Link href={`/mind/${currentDay}`} style={{ display: "block", marginBottom: 16, textDecoration: "none" }}>
          <div style={{ position: "relative", background: "#171B21", borderRadius: 20, border: "1px solid rgba(200,150,90,0.2)", padding: "20px 20px 20px 24px", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 2.5, background: "#C8965A", borderRadius: "20px 0 0 20px" }} />
            <p style={{ fontSize: 9, color: "#C8965A", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "Inter, sans-serif", marginBottom: 8 }}>
              Today · Day {currentDay}
            </p>
            <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 24, fontWeight: 400, color: "#F2F1ED", lineHeight: 1.2, marginBottom: 4 }}>
              {today.title}
            </h2>
            <p style={{ fontSize: 11, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginBottom: 14 }}>{today.phase}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 10, color: "#F2F1ED", fontFamily: "Inter, sans-serif", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em" }}>Start lesson</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 12, height: 12, color: "#C8965A" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span style={{ fontSize: 10, color: "#3D434D", fontFamily: "Inter, sans-serif", marginLeft: 4 }}>5–8 min</span>
            </div>
          </div>
        </Link>
      )}

      {/* STRONG System phases */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 9, color: "#9BA3AF", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "Inter, sans-serif", marginBottom: 12 }}>
          30-Day Programme
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PHASES.map(({ code, name, days }) => {
            const isActive = days.includes(currentDay);
            return (
              <div key={code} style={{ background: "#171B21", borderRadius: 14, border: `1px solid ${isActive ? "rgba(200,150,90,0.2)" : "#252A32"}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? "rgba(200,150,90,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? "rgba(200,150,90,0.2)" : "#252A32"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 16, color: isActive ? "#C8965A" : "#3D434D", fontWeight: 400 }}>{code}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: isActive ? "#F2F1ED" : "#9BA3AF", fontFamily: "Inter, sans-serif", fontWeight: 500, marginBottom: 1 }}>{name}</p>
                  <p style={{ fontSize: 10, color: "#3D434D", fontFamily: "Inter, sans-serif" }}>Days {days[0]}–{days[days.length - 1]}</p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {days.map((d) => (
                    <Link key={d} href={`/mind/${d}`} style={{ textDecoration: "none" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: "Inter, sans-serif", fontWeight: 600, background: d === currentDay ? "#C8965A" : d < currentDay ? "rgba(52,211,153,0.12)" : "#252A32", color: d === currentDay ? "#0E1014" : d < currentDay ? "#34D399" : "#3D434D" }}>
                        {d}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Lessons */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 9, color: "#9BA3AF", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "Inter, sans-serif", marginBottom: 12 }}>
          Audio Lessons
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {AUDIO_LESSONS.map((lesson) => (
            <AudioPlayer key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </div>

      {/* Breathwork */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 9, color: "#9BA3AF", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "Inter, sans-serif", marginBottom: 12 }}>
          Breathwork
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {BREATHWORK.map((bw) => (
            <Link key={bw.id} href={`/breathwork/${bw.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#171B21", borderRadius: 14, border: "1px solid #252A32", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid rgba(200,150,90,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8965A" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 15, color: "#F2F1ED", fontWeight: 400, lineHeight: 1.2 }}>{bw.name}</p>
                  <p style={{ fontSize: 10, color: "#9BA3AF", fontFamily: "Inter, sans-serif", marginTop: 2 }}>{bw.subtitle} · {bw.duration}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 14, height: 14, color: "#3D434D", flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
