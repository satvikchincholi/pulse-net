// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: authData, error: authErr } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    // Check role and do a full-page navigation so middleware cookies are fresh
    const { data: official } = await supabase
      .from("municipal_officials")
      .select("id")
      .eq("id", authData.user?.id)
      .maybeSingle();

    // Full reload so Next.js middleware sees the new session cookie
    window.location.href = official ? "/responder/dashboard" : "/citizen/dashboard";
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white selection:bg-cyan-500/30 font-sans transition-colors duration-500">
      {/* Background Watermorphism Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-300/30 dark:bg-cyan-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[100px] dark:blur-[120px] animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[100px] dark:blur-[120px] animate-[float_12s_ease-in-out_infinite_reverse]" />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}} />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo / Brand */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] mx-auto mb-2">
            <span className="text-3xl">📡</span>
          </div>
          <h1 className="text-4xl font-manrope font-extrabold tracking-tight text-slate-900 dark:text-white">
            PulseNet
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-white/50">Sign in to your Citizen Node</p>
        </div>

        {/* Card */}
        <div className="rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-8 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/50"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-300/50 dark:border-white/10 bg-slate-100/50 dark:bg-black/20 px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/50"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-300/50 dark:border-white/10 bg-slate-100/50 dark:bg-black/20 px-4 py-3.5 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex w-full mt-4 items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-4 py-3.5 text-sm font-bold text-white dark:text-black transition hover:bg-slate-800 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg dark:shadow-none"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="rounded-[2rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl px-6 py-5 text-center text-xs font-bold text-slate-500 dark:text-white/50 space-y-2 shadow-xl dark:shadow-none">
          <div>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Sign Up
            </Link>
          </div>
          <div>
            Municipal official?{" "}
            <Link
              href="/auth/responder/login"
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors"
            >
              Responder Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
