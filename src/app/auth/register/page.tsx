// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = password.length > 0 && password === confirmPw;
  const passwordMinLength = password.length >= 6;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordMinLength) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // 1️⃣ Sign up with Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone_number: phone,
        },
      },
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Insert citizen profile row (user may be null if email confirmation required)
    const uid = authData.user?.id;
    if (uid) {
      const { error: profileErr } = await supabase.from("users").insert({
        id: uid,
        username,
        email,
        phone_number: phone,
      });

      if (profileErr) {
        console.error("Profile insert error:", profileErr.message);
        // Don't block registration — the row can be created on first login
      }

      // Redirect to dashboard
      window.location.href = "/citizen/dashboard";
    } else {
      // Email confirmation is required — show a message instead of redirecting
      setError("Check your email to confirm your account, then log in.");
      setLoading(false);
    }
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
          <p className="text-sm font-medium text-slate-500 dark:text-white/50">
            Sign up to report civic issues &amp; track progress
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-8 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="reg-username" className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/50">
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-300/50 dark:border-white/10 bg-slate-100/50 dark:bg-black/20 px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none"
                placeholder="johndoe"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/50">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-300/50 dark:border-white/10 bg-slate-100/50 dark:bg-black/20 px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none"
                placeholder="you@example.com"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="reg-phone" className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/50">
                Phone Number
              </label>
              <input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-300/50 dark:border-white/10 bg-slate-100/50 dark:bg-black/20 px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/50">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-2xl border border-slate-300/50 dark:border-white/10 bg-slate-100/50 dark:bg-black/20 px-4 py-3.5 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength hint */}
              {password.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  {passwordMinLength ? (
                    <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <XCircle size={14} className="text-red-500 dark:text-red-400" />
                  )}
                  <span className={passwordMinLength ? "text-emerald-500 dark:text-emerald-400 font-bold" : "text-red-500 dark:text-red-400 font-bold"}>
                    At least 6 characters
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/50">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirmPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  className={`w-full rounded-2xl border bg-slate-100/50 dark:bg-black/20 px-4 py-3.5 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none
                    ${confirmPw.length > 0
                      ? passwordsMatch
                        ? "border-emerald-500/50 focus:border-emerald-500/80"
                        : "border-red-500/50 focus:border-red-500/80"
                      : "border-slate-300/50 dark:border-white/10 focus:border-cyan-500/50"
                    }`}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition"
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPw.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400" />
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-red-500 dark:text-red-400" />
                      <span className="text-red-500 dark:text-red-400 font-bold">Passwords don&apos;t match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !email || !phone || !passwordsMatch}
              className="flex w-full mt-4 items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-4 py-3.5 text-sm font-bold text-white dark:text-black transition hover:bg-slate-800 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg dark:shadow-none"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <div className="rounded-[2rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl px-6 py-5 text-center text-xs font-bold text-slate-500 dark:text-white/50 shadow-xl dark:shadow-none">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
