"use client";

import { useState } from "react";

const WEEKS = [1, 2, 3, 4];

export default function SetWeekButton({ userId, currentWeek }: { userId: string; currentWeek: number }) {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(currentWeek);
  const [error, setError] = useState("");

  async function setWeek(week: number) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/set-week", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, week }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error ?? "Failed");
    else setActive(week);
  }

  return (
    <div>
      <div className="flex gap-2">
        {WEEKS.map((w) => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            disabled={loading || active === w}
            className={`flex-1 rounded-xl p-2 text-sm font-condensed font-bold uppercase tracking-wide border transition-all ${
              active === w
                ? "bg-edge-gold text-black border-edge-gold"
                : "bg-edge-surface border-white/10 text-white/50 active:bg-white/10"
            } disabled:opacity-50`}
          >
            Wk {w}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
