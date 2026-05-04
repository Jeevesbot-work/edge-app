"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-edge-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-edge-red mb-6">
            <span className="font-condensed font-black text-2xl text-white tracking-wider">B2S</span>
          </div>
          <h1 className="font-condensed font-black text-4xl text-white tracking-wide uppercase">
            Back2Strong
          </h1>
          <p className="text-edge-muted text-sm mt-2 font-body">
            Your daily performance coach.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-edge-muted uppercase tracking-widest mb-2 font-body">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white text-base font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-red transition-colors"
              />
            </div>

            {error && (
              <p className="text-edge-red text-sm font-body">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 transition-opacity active:scale-95"
            >
              {loading ? "Sending..." : "Get Access Link"}
            </button>

            <p className="text-center text-edge-muted text-xs font-body leading-relaxed">
              We'll send a magic link to your email. No password needed.
            </p>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-condensed font-bold text-2xl uppercase tracking-wide">
              Check your email
            </h2>
            <p className="text-edge-muted text-sm font-body leading-relaxed">
              We've sent a link to <span className="text-white">{email}</span>. Tap it to access your account.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-edge-muted text-xs underline"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
