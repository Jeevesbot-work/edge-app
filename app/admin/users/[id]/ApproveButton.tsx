"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function approve() {
    setLoading(true);
    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, approved: true }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={approve}
      disabled={loading}
      className="bg-green-600 text-white font-condensed font-bold text-sm uppercase tracking-wide px-4 py-2 rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
    >
      {loading ? "Approving..." : "Approve Access"}
    </button>
  );
}
