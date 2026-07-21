"use client";

import { useEffect, useState } from "react";
import { alreadyHandledPush, dismissPushPrompt, enableProteinPacePush, pushSupported } from "@/lib/push";

// Gentle, on-brand opt-in for Protein Pace nudges. Rendered at a natural moment
// (after the client has logged a meal), never on first app open. Self-hides if
// push is unsupported, already granted/denied, or dismissed on this device.
export default function PushOptIn({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "working" | "done" | "denied" | "error">("idle");

  useEffect(() => {
    if (show && pushSupported() && !alreadyHandledPush()) setVisible(true);
  }, [show]);

  if (!visible) return null;

  async function enable() {
    setStatus("working");
    const result = await enableProteinPacePush();
    if (result === "subscribed") {
      setStatus("done");
      setTimeout(() => setVisible(false), 1800);
    } else if (result === "denied") {
      setStatus("denied");
      setTimeout(() => setVisible(false), 2500);
    } else {
      setStatus("error");
      setTimeout(() => setVisible(false), 2500);
    }
  }

  function notNow() {
    dismissPushPrompt();
    setVisible(false);
  }

  return (
    <div className="anim-0 mb-6 bg-edge-surface rounded-[20px] p-4 border border-edge-bronze/30">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-edge-bronze/10 border border-edge-bronze/20 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-edge-bronze">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          {status === "done" ? (
            <p className="text-white text-sm font-condensed font-bold uppercase tracking-wide">You&apos;re set — I&apos;ll give you a nudge when it helps.</p>
          ) : status === "denied" ? (
            <p className="text-edge-muted text-sm">No worries — you can turn this on later in your phone settings.</p>
          ) : status === "error" ? (
            <p className="text-edge-muted text-sm">Couldn&apos;t set that up just now. We&apos;ll try again another time.</p>
          ) : (
            <>
              <p className="font-condensed font-bold text-sm uppercase tracking-wide text-white mb-0.5">A quiet nudge if you&apos;re running short?</p>
              <p className="text-edge-muted text-xs leading-relaxed mb-3">
                Some evenings protein slips — busy day, food on the go. I can drop you a couple of quick ideas when that happens. No numbers, no nagging.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={enable}
                  disabled={status === "working"}
                  className="pressable bg-edge-bronze text-white font-condensed font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  {status === "working" ? "Setting up…" : "Yes, nudge me"}
                </button>
                <button
                  onClick={notNow}
                  className="text-edge-muted font-condensed font-bold text-xs uppercase tracking-widest px-4 py-2"
                >
                  Not now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
