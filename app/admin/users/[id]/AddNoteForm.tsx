"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddNoteForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    await fetch("/api/admin/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, note }),
    });
    setNote("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note visible to Edge..."
        className="flex-1 bg-edge-surface border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-gold"
      />
      <button
        type="submit"
        disabled={saving || !note.trim()}
        className="bg-edge-gold text-edge-bg font-condensed font-bold text-sm uppercase tracking-wide px-4 py-3 rounded-xl disabled:opacity-50 flex-shrink-0"
      >
        {saving ? "..." : "Add"}
      </button>
    </form>
  );
}
