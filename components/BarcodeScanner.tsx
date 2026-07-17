"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

// Full-screen camera overlay that scans a product barcode and hands the
// code back. Restricted to the 1D formats real packaged food uses, and
// forced to the rear camera. Works on iPhone Safari (native detector doesn't).
export default function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let controls: { stop: () => void } | null = null;
    let cancelled = false;

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);

    const reader = new BrowserMultiFormatReader(hints);

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current!,
        (result, _err, ctrl) => {
          if (ctrl && !controls) controls = ctrl;
          if (result && !cancelled) {
            cancelled = true;
            controls?.stop();
            onDetected(result.getText());
          }
        }
      )
      .catch(() => {
        if (!cancelled) setError("Couldn't open the camera. Check camera permissions and try again.");
      });

    return () => {
      cancelled = true;
      try { controls?.stop(); } catch {}
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 pt-safe">
        <p className="font-condensed font-bold text-sm uppercase tracking-widest text-white">Scan Barcode</p>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
        {/* Aiming frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-40 border-2 border-edge-bronze rounded-2xl relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-edge-bronze/80 animate-pulse" />
          </div>
        </div>
        {error && (
          <div className="absolute bottom-8 left-4 right-4 bg-edge-red/10 border border-edge-red/30 rounded-xl p-4">
            <p className="text-edge-red text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="px-6 py-6 pb-safe text-center">
        <p className="text-white/70 text-sm">Point at the barcode on the packet. Hold steady.</p>
      </div>
    </div>
  );
}
