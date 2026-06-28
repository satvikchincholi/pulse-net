// src/app/citizen/communities/JoinCommunityButton.tsx
"use client";

import { useState, FormEvent } from "react";
import { joinCommunity } from "@/app/actions/communityActions";

export function JoinCommunityButton({ communityId }: { communityId: string }) {
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await joinCommunity(communityId);
    if (result.success) {
      setJoined(true);
    } else {
      setError(result.error || "Failed to join");
    }
    setLoading(false);
  }

  if (joined) return <div className="mt-4"><span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">Member</span></div>;

  return (
    <form onSubmit={handleJoin} className="mt-4 w-full">
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full py-2.5 px-4 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 border border-slate-300/50 dark:border-white/10 text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white transition-all disabled:opacity-50 shadow-sm"
      >
        {loading ? "Joining…" : "Join Community"}
      </button>
      {error && <p className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-2 uppercase tracking-widest">{error}</p>}
    </form>
  );
}
