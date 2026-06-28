// src/app/auth/responder/register/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2, ShieldCheck } from "lucide-react";

export default function ResponderRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [jurisdictionArea, setJurisdictionArea] = useState("");
  
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1️⃣ Sign up with Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Insert municipal_officials profile row
    const uid = authData.user?.id;
    if (uid) {
      const { error: profileErr } = await supabase.from("municipal_officials").insert({
        id: uid,
        email,
        employee_id: employeeId,
        department,
        jurisdiction_area: jurisdictionArea,
        // Defaults like tier='bronze' are handled by SQL schema
      });

      if (profileErr) {
        console.error("Profile insert error:", profileErr.message);
        setError("Error setting up official profile: " + profileErr.message);
        setLoading(false);
        return;
      }

      // Middleware will route them
      window.location.href = "/responder/dashboard";
    } else {
      setError("Please check your email to confirm your official account, then sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950">
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 mx-auto">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Official Registration
          </h1>
          <p className="text-sm text-emerald-400">Apply for a Municipal Responder Account</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/50 backdrop-blur-xl p-6 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase text-slate-400">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                  placeholder="EMP-10294"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase text-slate-400">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                  placeholder="Public Works"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase text-slate-400">Jurisdiction Area (Ward/Zone)</label>
              <input
                type="text"
                value={jurisdictionArea}
                onChange={(e) => setJurisdictionArea(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                placeholder="Ward 42, Downtown"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase text-slate-400">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                placeholder="worker@municipality.gov"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase text-slate-400">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-emerald-500"
                  placeholder="Min 6 chars"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={loading || !email || !password || !employeeId || !department || !jurisdictionArea}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><UserPlus size={18} /> Apply for Access</>}
            </button>
          </form>
        </div>

        <div className="text-center text-sm text-slate-400">
          Already verified? <Link href="/auth/responder/login" className="text-emerald-400">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
