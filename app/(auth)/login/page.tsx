"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [magicSent, setMagicSent] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
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
      setMagicSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-edge-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
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

        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
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
            <div>
              <label className="block text-xs text-edge-muted uppercase tracking-widest mb-2 font-body">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white text-base font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-red transition-colors"
              />
            </div>

            {error && <p className="text-edge-red text-sm font-body">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 transition-opacity active:scale-95"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-edge-muted text-xs font-body">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              type="button"
              onClick={() => { setMode("magic"); setError(""); }}
              className="w-full border border-white/10 text-white/70 font-body text-sm py-3 rounded-xl active:bg-white/5 transition-colors"
            >
              Send magic link instead
            </button>

            <p className="text-center text-edge-muted text-xs font-body mt-4">
              New here?{" "}
              <Link href="/signup" className="text-white underline">
                Create an account
              </Link>
            </p>
          </form>
        )}

        {mode === "magic" && !magicSent && (
          <form onSubmit={handleMagicLink} className="space-y-4">
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

            {error && <p className="text-edge-red text-sm font-body">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 transition-opacity active:scale-95"
            >
              {loading ? "Sending..." : "Get Access Link"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("password"); setError(""); }}
              className="w-full text-edge-muted text-sm font-body py-2"
            >
              ← Back to password login
            </button>
          </form>
        )}

        {mode === "magic" && magicSent && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-condensed font-bold text-2xl uppercase tracking-wide">Check your email</h2>
            <p className="text-edge-muted text-sm font-body leading-relaxed">
              We've sent a link to <span className="text-white">{email}</span>. Tap it to access your account.
            </p>
            <button onClick={() => { setMagicSent(false); setMode("password"); }} className="text-edge-muted text-xs underline">
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
