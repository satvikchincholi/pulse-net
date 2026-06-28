"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";

export default function CitizenProfilePage() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-2xl mx-auto w-full transition-colors duration-300">
      <div className="flex flex-col items-center justify-center p-12 bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[2.5rem] shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)] mt-4">
        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,211,238,0.4)]">
          <UserIcon size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{user?.email || "Citizen"}</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50 mt-2">PulseNet Contributor</p>
        
        <div className="w-full h-px bg-slate-200/50 dark:bg-white/10 my-8"></div>
        
        <form action="/auth/signout" method="post" className="w-full max-w-sm">
          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all font-bold text-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
