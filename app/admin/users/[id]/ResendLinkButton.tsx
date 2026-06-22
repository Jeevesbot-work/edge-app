"use client";

import { useState } from "react";

export default function ResendLinkButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function resend() {
    setState("loading");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setState(res.ok ? "sent" : "error");
  }

  if (state === "sent") {
    return (
      <span className="bg-emerald-500/20 text-emerald-400 font-condensed text-xs uppercase px-3 py-1.5 rounded-lg">
        Link sent
      </span>
    );
  }

  return (
    <button
      onClick={resend}
      disabled={state === "loading"}
      className="bg-edge-bronze/20 text-edge-bronze font-condensed font-bold text-xs uppercase tracking-wide px-3 py-1.5 rounded-lg disabled:opacity-50 active:scale-95 transition-transform"
    >
      {state === "loading" ? "Sending..." : state === "error" ? "Failed — retry" : "Resend Link"}
    </button>
  );
}
