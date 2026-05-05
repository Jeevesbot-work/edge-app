"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // If session is immediately available (email confirm disabled), go to app
    if (data.session) {
      router.push("/");
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-edge-bg flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-condensed font-bold text-2xl uppercase tracking-wide">Check your email</h2>
          <p className="text-edge-muted text-sm font-body leading-relaxed">
            We've sent a confirmation link to <span className="text-white">{email}</span>. Click it to activate your account.
          </p>
          <Link href="/login" className="block text-edge-muted text-xs underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
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
          <p className="text-edge-muted text-sm mt-2 font-body">Create your account.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
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
              placeholder="Min. 8 characters"
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white text-base font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-red transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-edge-muted uppercase tracking-widest mb-2 font-body">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-edge-surface border border-white/10 rounded-xl px-4 py-4 text-white text-base font-body placeholder:text-edge-muted focus:outline-none focus:border-edge-red transition-colors"
            />
          </div>

          {error && <p className="text-edge-red text-sm font-body">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password || !confirm}
            className="w-full bg-edge-red text-white font-condensed font-bold text-xl uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 transition-opacity active:scale-95"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-edge-muted text-xs font-body mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-white underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
