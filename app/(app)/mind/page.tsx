import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LESSONS } from "@/lib/data/lessons";
import { getPhaseColor } from "@/lib/utils";

const AUDIO_LESSONS = [
  { id: 1, title: "Identity Beats Motivation", duration: "12 min", category: "Identity" },
  { id: 2, title: "Why Midlife Feels Different", duration: "14 min", category: "Mindset" },
  { id: 3, title: "The Back2Strong Code", duration: "10 min", category: "Identity" },
  { id: 4, title: "Post-40 Playbook", duration: "18 min", category: "Training" },
  { id: 5, title: "Consistency Over Intensity", duration: "11 min", category: "Training" },
  { id: 6, title: "Recovery is King", duration: "13 min", category: "Recovery" },
  { id: 7, title: "The STRONG Operating System", duration: "15 min", category: "Mindset" },
  { id: 8, title: "Maximize Recovery Without Sleeping More", duration: "16 min", category: "Recovery" },
];

const BREATHWORK = [
  { id: "box", name: "Box Breathing", subtitle: "Navy SEAL technique for stress and focus", rounds: 4, duration: "64 seconds", color: "#E8291C" },
  { id: "478", name: "4-7-8 Breathing", subtitle: "Relaxation and sleep technique", rounds: 4, duration: "76 seconds", color: "#F5A623" },
  { id: "power", name: "Power Breathing", subtitle: "Quick energy and clarity boost", rounds: 10, duration: "60 seconds", color: "#3B82F6" },
];

export default async function MindPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: programme }, { data: completions }] = await Promise.all([
    supabase.from("programme_state").select("*").eq("user_id", user!.id).single(),
    supabase.from("lesson_completions").select("day_number, cycle").eq("user_id", user!.id),
  ]);

  const currentDay = programme?.current_day ?? 1;
  const currentCycle = programme ? Math.ceil(currentDay / 30) : 1;
  const dayInCycle = ((currentDay - 1) % 30) + 1;
  const today = LESSONS.find((l) => l.day === dayInCycle);

  const completedDays = new Set((completions ?? []).map((c) => `${c.cycle}-${c.day_number}`));

  const phaseGroups = [
    { code: "S", name: "Self-Confrontation", days: [1, 2, 3, 4, 5] },
    { code: "T", name: "Truth Mapping", days: [6, 7, 8, 9, 10] },
    { code: "R", name: "Reflective Evolution", days: [11, 12, 13, 14, 15] },
    { code: "O", name: "Ownership Routines", days: [16, 17, 18, 19, 20] },
    { code: "N", name: "Non-Negotiables", days: [21, 22, 23, 24, 25] },
    { code: "G", name: "Growth Loops", days: [26, 27, 28, 29, 30] },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-safe pb-6">
      <div className="py-4 mb-2">
        <h1 className="font-condensed font-black text-4xl uppercase tracking-wide">Mind</h1>
        <p className="text-edge-muted text-sm mt-1">STRONG System · Cycle {currentCycle} · Day {dayInCycle}</p>
      </div>

      {/* Today's lesson */}
      {today && (
        <Link href={`/mind/${dayInCycle}`}>
          <div className="rounded-xl p-4 border border-edge-gold/30 mb-6 relative overflow-hidden active:opacity-90"
            style={{ background: "linear-gradient(135deg, rgba(245,166,35,0.1), rgba(26,26,26,1))" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-edge-gold font-condensed font-bold text-xs uppercase tracking-widest">Today</span>
              <span className="text-edge-muted text-xs">· Phase {today.phaseCode}</span>
            </div>
            <h2 className="font-condensed font-black text-2xl uppercase tracking-wide text-white mb-1 leading-tight">
              Day {dayInCycle}: {today.title}
            </h2>
            <p className="text-edge-muted text-sm mb-4 font-body">{today.phase}</p>
            <div className="flex items-center gap-2">
              <span className="bg-edge-red text-white font-condensed font-bold text-xs uppercase tracking-wide px-3 py-1.5 rounded-lg">
                Start Lesson
              </span>
              <span className="text-edge-muted text-xs">5-8 min</span>
            </div>
          </div>
        </Link>
      )}

      {/* STRONG System phases */}
      <div className="mb-6">
        <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
          STRONG System — Cycle {currentCycle}
        </h2>
        <div className="space-y-2">
          {phaseGroups.map(({ code, name, days }) => {
            const isActive = days.includes(dayInCycle);
            return (
              <div key={code} className={`bg-edge-surface rounded-xl border ${isActive ? "border-edge-gold/30" : "border-white/[0.08]"}`}>
                <div className="flex items-center gap-3 p-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${getPhaseColor(code)}20` }}
                  >
                    <span className="font-condensed font-black text-sm" style={{ color: getPhaseColor(code) }}>{code}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-condensed font-bold text-sm uppercase tracking-wide text-white leading-none">{name}</p>
                    <p className="text-edge-muted text-xs mt-0.5">Days {days[0]}–{days[days.length - 1]}</p>
                  </div>
                  <div className="flex gap-1">
                    {days.map((d) => (
                      <Link key={d} href={`/mind/${d}`}>
                        <div className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-condensed font-bold transition-colors ${
                          completedDays.has(`${currentCycle}-${d}`)
                            ? "bg-green-500/20 text-green-400"
                            : d === dayInCycle
                            ? "border border-edge-gold text-edge-gold"
                            : "bg-white/5 text-edge-muted"
                        }`}>
                          {d}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio lessons */}
      <div className="mb-6">
        <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
          Audio Lessons
        </h2>
        <div className="space-y-2">
          {AUDIO_LESSONS.map((lesson) => (
            <div key={lesson.id} className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-edge-red flex items-center justify-center flex-shrink-0 active:scale-95">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm text-white truncate">{lesson.title}</p>
                <p className="text-edge-muted text-xs mt-0.5">{lesson.duration} · {lesson.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breathwork */}
      <div>
        <h2 className="font-condensed font-bold text-xs uppercase tracking-widest text-edge-muted mb-3">
          Breathwork
        </h2>
        <div className="space-y-3">
          {BREATHWORK.map((bw) => (
            <Link key={bw.id} href={`/breathwork/${bw.id}`}>
              <div className="bg-edge-surface rounded-xl p-4 border border-white/[0.08] flex items-center gap-4 active:bg-white/5">
                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: bw.color }}>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: bw.color, opacity: 0.6 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-condensed font-bold text-sm uppercase tracking-wide text-white">{bw.name}</p>
                  <p className="text-edge-muted text-xs mt-0.5">{bw.rounds} rounds · {bw.duration}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-muted flex-shrink-0">
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
