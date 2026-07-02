"use client";

import { useState } from "react";

const PROGRAMMES = [
  { id: "barry-strong90-block1", label: "Barry — Block 1: Audit & Foundations (walking)" },
  { id: "barry-strong90-block2", label: "Barry — Block 2: Starter Weights Programme" },
  { id: "alex-gale-strong90-block1", label: "Alex Gale — Block 1: Fuel & Foundation" },
];

export default function AssignProgrammeButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function assign(programmeId: string) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/assign-programme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, programmeId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error ?? "Failed");
    else setDone(true);
  }

  if (done) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
        <p className="text-green-400 text-sm font-condensed font-bold uppercase tracking-wide">Programme assigned</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {PROGRAMMES.map((p) => (
        <button
          key={p.id}
          onClick={() => assign(p.id)}
          disabled={loading}
          className="w-full bg-edge-gold/10 border border-edge-gold/30 rounded-xl p-3 text-left active:bg-edge-gold/20 disabled:opacity-50"
        >
          <p className="font-condensed font-bold text-sm text-edge-gold uppercase tracking-wide">
            {loading ? "Assigning..." : "Assign"}
          </p>
          <p className="text-white/70 text-xs mt-0.5">{p.label}</p>
        </button>
      ))}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
